import { MAX_IMAGE_DIMENSION } from '../constants';

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file is not a valid image.'));
    img.src = src;
  });

/**
 * Shrinks an uploaded image to a small JPEG data URL so db.json stays light
 * and the app stays fast.
 */
export const compressImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
  const img = await loadImage(await readFileAsDataUrl(file));
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is not supported in this browser.');
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
};
