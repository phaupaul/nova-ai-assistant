// Prevent duplicate class declaration
if (!window.PageContentExtractorLoaded) {
    window.PageContentExtractorLoaded = true;

class PageContentExtractor {
    constructor() {
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'getPageContent') {
                this.extractContent(request.includeImages)
                    .then(content => sendResponse({ success: true, data: content }))
                    .catch(error => sendResponse({ success: false, error: error.message }));
                return true; // Keep message channel open
            }
        });
    }

    async extractContent(includeImages = false) {
        try {
            const content = {
                url: window.location.href,
                title: document.title,
                text: this.extractText(),
                headings: this.extractHeadings(),
                metadata: this.extractMetadata()
            };

            if (includeImages) {
                content.images = await this.extractImages();
            }

            return content;
        } catch (error) {
            console.error('Content extraction failed:', error);
            throw new Error('Failed to extract page content: ' + error.message);
        }
    }

    extractText() {
        try {
            // Remove unwanted elements
            const elementsToRemove = [
                'script', 'style', 'nav', 'header', 'footer', 
                '.advertisement', '.ad', '.sidebar', '.menu',
                '[role="banner"]', '[role="navigation"]', '[role="complementary"]'
            ];

            const clone = document.cloneNode(true);
            elementsToRemove.forEach(selector => {
                const elements = clone.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });

            // Try to find main content area
            const mainSelectors = [
                'main', 'article', '[role="main"]', '.content', '.main-content',
                '#content', '#main', '.post-content', '.entry-content'
            ];

            let mainContent = null;
            for (const selector of mainSelectors) {
                mainContent = clone.querySelector(selector);
                if (mainContent) break;
            }

            // Fall back to body if no main content found
            if (!mainContent) {
                mainContent = clone.body || clone.documentElement;
            }

            // Extract text content
            let text = mainContent.innerText || mainContent.textContent || '';
            
            // Clean up the text
            text = text.replace(/\s+/g, ' ').trim();
            text = text.replace(/\n\s*\n/g, '\n');
            
            // Limit content length for API efficiency
            const maxLength = 12000;
            if (text.length > maxLength) {
                text = text.substring(0, maxLength) + '...[content truncated for efficiency]';
            }

            return text;
        } catch (error) {
            console.error('Text extraction failed:', error);
            return document.body?.innerText?.substring(0, 5000) || 'Unable to extract text content';
        }
    }

    extractHeadings() {
        try {
            const headings = [];
            const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            
            headingSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    if (text && text.length > 3) {
                        headings.push(`${selector.toUpperCase()}: ${text}`);
                    }
                });
            });

            return headings.slice(0, 20); // Limit to first 20 headings
        } catch (error) {
            console.error('Heading extraction failed:', error);
            return [];
        }
    }

    extractMetadata() {
        try {
            const metadata = {};

            // Open Graph tags
            const ogTags = document.querySelectorAll('meta[property^="og:"]');
            ogTags.forEach(tag => {
                const property = tag.getAttribute('property');
                const content = tag.getAttribute('content');
                if (content) {
                    metadata[property] = content;
                }
            });

            // Twitter Card tags
            const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
            twitterTags.forEach(tag => {
                const name = tag.getAttribute('name');
                const content = tag.getAttribute('content');
                if (content) {
                    metadata[name] = content;
                }
            });

            // Standard meta tags
            const metaTags = ['description', 'keywords', 'author'];
            metaTags.forEach(name => {
                const tag = document.querySelector(`meta[name="${name}"]`);
                if (tag) {
                    metadata[name] = tag.getAttribute('content');
                }
            });

            return metadata;
        } catch (error) {
            console.error('Metadata extraction failed:', error);
            return {};
        }
    }

    async extractImages() {
        try {
            const images = [];
            const imageElements = document.querySelectorAll('img');
            
            // Process up to 3 significant images
            const significantImages = Array.from(imageElements)
                .filter(img => {
                    // Filter out small images, icons, and loading placeholders
                    const width = img.naturalWidth || img.width;
                    const height = img.naturalHeight || img.height;
                    const area = width * height;
                    
                    return area > 10000 && // Minimum area
                           width > 100 && height > 100 && // Minimum dimensions
                           img.src && 
                           !img.src.includes('icon') &&
                           !img.src.includes('logo') &&
                           !img.alt?.toLowerCase().includes('icon');
                })
                .slice(0, 3);

            for (const img of significantImages) {
                try {
                    const base64Data = await this.imageToBase64(img);
                    if (base64Data) {
                        images.push(base64Data);
                    }
                } catch (error) {
                    console.warn('Failed to convert image to base64:', error);
                }
            }

            return images;
        } catch (error) {
            console.error('Image extraction failed:', error);
            return [];
        }
    }

    imageToBase64(img) {
        return new Promise((resolve, reject) => {
            try {
                // Check if image is loaded
                if (!img.complete || img.naturalWidth === 0) {
                    img.onload = () => this.convertToBase64(img, resolve, reject);
                    img.onerror = () => reject(new Error('Image failed to load'));
                } else {
                    this.convertToBase64(img, resolve, reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    convertToBase64(img, resolve, reject) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image if too large
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression
            const base64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Remove data URL prefix to get just the base64 data
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
        } catch (error) {
            reject(error);
        }
    }

    // Utility method to check if page content has changed
    getPageFingerprint() {
        const title = document.title;
        const headings = this.extractHeadings().slice(0, 5).join('|');
        const firstParagraph = document.querySelector('p')?.textContent?.substring(0, 100) || '';
        
        return `${title}|${headings}|${firstParagraph}`;
    }
}

// Initialize content extractor
new PageContentExtractor();

} // End of PageContentExtractorLoaded check