
// Automated Image Placeholder Generator
// Generates appropriate, unique poster URLs based on movie context

// Genre-to-image theme mapping
const genreThemes = {
  'action': 'cinema,explosion',
  'adventure': 'travel,mountain',
  'animation': 'cartoon,kids',
  'comedy': 'funny,party',
  'crime': 'detective,police',
  'documentary': 'nature,documentary',
  'drama': 'portrait,emotional',
  'fantasy': 'fantasy,magic',
  'horror': 'spooky,dark',
  'musical': 'music,concert',
  'mystery': 'detective,secret',
  'romance': 'love,romantic',
  'sci-fi': 'space,futuristic',
  'thriller': 'suspense,dark',
  'war': 'war,soldier',
  'western': 'cowboy,desert'
};

/**
 * Generates a unique, context-aware poster URL
 * @param {string} title - Movie title (for unique seed)
 * @param {string[]} genres - Movie genres (for theme)
 * @param {number} width - Desired width (default 400)
 * @param {number} height - Desired height (default 600)
 * @returns {string} Poster URL
 */
function generatePosterUrl(title, genres = [], width = 400, height = 600) {
  // Validate inputs
  if (!title) {
    throw new Error('Movie title is required for generating poster');
  }

  // Create a sanitized, unique seed from the title
  const seed = title.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Get relevant keywords from genres
  let keywords = 'cinema,movie'; // Default keywords
  if (genres && genres.length > 0) {
    const genreKeywords = genres
      .map(g => genreThemes[g.toLowerCase()])
      .filter(Boolean);
    
    if (genreKeywords.length > 0) {
      keywords = genreKeywords.join(',');
    }
  }

  // Validate dimensions (reasonable aspect ratio for movie posters is ~2:3)
  const validWidth = Math.max(100, Math.min(2000, width));
  const validHeight = Math.max(150, Math.min(3000, height));

  // Using picsum.photos for consistent, unique, and reliable placeholders
  // Seed ensures same poster for same movie every time
  const posterUrl = `https://picsum.photos/seed/${seed}/${validWidth}/${validHeight}`;

  return posterUrl;
}

/**
 * Validates if an image URL exists and is accessible (simple check)
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
async function validateImageUrl(url) {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn(`Image validation failed for ${url}:`, error.message);
    return false;
  }
}

module.exports = {
  generatePosterUrl,
  validateImageUrl
};
