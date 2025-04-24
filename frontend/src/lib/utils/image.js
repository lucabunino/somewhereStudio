import imageUrlBuilder from '@sanity/image-url';
import { client } from '$lib/utils/sanity.js';

// Get a pre-configured url-builder from your sanity client
const builder = imageUrlBuilder(client)

// Then we like to make a simple function like this that gives the
// builder an image and returns the builder for you to specify additional
// parameters:
export function urlFor(source) {
  if (source) {
    return builder.image(source).auto('format') 
  }
}