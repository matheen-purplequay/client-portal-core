import type { Template } from "../../../../../../core/models/template";

export const generateRandomId = () => {
    return Math.floor(Math.random() * 1000000);
};

export const detectDocuments = (text: string, index: number, updatedTemplate: Template, userData: any) => {
    console.log('text in detect documents ', text, index);
    // Clear the detected documents list
    let detectedDocuments: string[] = [];

    // Detect if the text contains HTML (using <li> elements) or numbered items (1) or 1.)
    const containsHtmlList = /<li>/i.test(text); // Check if there's an HTML list (<li>)
    const containsNumberedList = /\d+\)|\d+\./i.test(text); // Check for numbered list pattern like 1) or 1.

    // Convert the query to lowercase for consistent keyword matching
    const description = text.toLowerCase();

    // Keywords that indicate a document request
    const documentRequestKeywords = [
      'documents',
      'workpapers',
      'file',
      'provide the following',
    ];

    // Check if the query includes document-related keywords
    const isRequestingDocuments = documentRequestKeywords.some(keyword =>
      description.includes(keyword)
    );

    if (!isRequestingDocuments) {
      return; // Exit if it's not a document request
    }

    if(containsHtmlList) {
      console.log('contains html list');
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const listItems = doc.querySelectorAll('li');
      detectedDocuments = Array.from(listItems).map(li => li.textContent?.trim() || '');
    } else if(containsNumberedList) {
      console.log('contains number list');
      
      // Extract document titles from the description
      // while ((match = documentRegex.exec(description)) !== null) {
      //   documentTitle = match[1].trim(); // Clean up extracted text
      // }
      // detectedDocuments = documentTitle.split(/\d+\)/).map(item => item.trim()).filter(item => item.length > 0);
      // Regex to extract numbered list items like 1) or 1.
      const documentRegex = /(?:\d+\)|\d+\.)\s*(.+)/g;
      let match;
      while ((match = documentRegex.exec(text)) !== null) {
        let documentTitle = match[1].trim();
        detectedDocuments.push(documentTitle);
      }
    }

    if(detectedDocuments.length > 0) {
      updatedTemplate.response_attachments = [];
      detectedDocuments.forEach((document: string) => {
        // Remove any stray HTML tags (e.g., "<p>")
        document = document.replace(/<[^>]+>/g, '');

        // Remove numbering at the beginning (e.g., "1)", "2)", etc.)
        document = document.trim().replace(/^\d+\)\s*/, '');  // This regex will match numbers with parenthesis at the start

        console.log('document title == ', document);

        updatedTemplate.response_attachments.push({
          documentID: generateRandomId(),
          title: toTitleCase(document),
          user_id: userData?.user_id,
          link: ''
        });
      });
      console.log('response documents ', detectedDocuments, updatedTemplate.response_attachments);
    }

    return detectedDocuments;
  }

  const toTitleCase = (str: string): string => {
    const smallWords = ['and', 'or', 'the', 'in', 'on', 'for', 'to', 'a', 'an'];
    
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !smallWords.includes(word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
      })
      .join(' ');
  }
