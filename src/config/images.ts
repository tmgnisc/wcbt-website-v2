/**
 * Real photos for content images. Content JSON only stores an image's alt text; any alt listed here is rendered
 * with this photo instead of the placeholder. Files live in public/images.
 */
export interface ImageSource {
  src: string;
  /** CSS object-position used when the photo is cropped to its frame (e.g. keep a face in view). */
  position?: string;
  /** Portrait photos get a square frame instead of 16:9. */
  portrait?: boolean;
}

export const IMAGES: Record<string, ImageSource> = {
  'Yuvraj Sharma, President': { src: '/images/president.jpg', position: '50% 18%', portrait: true },
};
