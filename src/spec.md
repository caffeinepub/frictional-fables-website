# Frictional Fables Website

A warm, cozy book-themed website for author Kriti's collection of stories with integrated reading experience, community features, and comprehensive admin content management.

## Core Features

### Homepage
- Hero section with warm, cozy book-themed design using provided background images
- **Dynamic site logo display positioned prominently in the top-right corner of the homepage header, fetched via getSiteAssets() with responsive sizing and positioning that maintains visibility and proper alignment across all device sizes**
- Featured Books section displaying uploaded book covers with titles, summaries, and "Read Now" buttons that open the uploaded PDFs or Word documents in the reader
- **Character Notes Preview section** displaying character note entries with preview images, short descriptions, and "View More" links to dedicated character notes viewing pages
- **Blogs Preview section** showcasing recent blog posts with header images, brief excerpts, and "Read More" links to full blog content
- **New Comings section** featuring upcoming releases with uploaded images, titles, text descriptions, release dates (if available), and preview information for future books and content in a visually cohesive showcase format
- Mobile-responsive layout with book-themed illustrations and reading quotes
- All preview sections maintain consistent cozy, book-themed styling with harmonious layout integration

### Book Reading Experience
- Web-based e-book reader for each uploaded book file (PDF or Word document) - read-only, no downloads
- PDF files render directly in embedded viewer (iframe or canvas) within the website interface
- Word documents (.doc or .docx) display in embedded online viewable format using inline document viewer (Google Docs viewer or Office web viewer)
- Seamless reading experience for all supported formats within the app interface with no external download prompts
- Thematic background design for reading interface
- Optional embedded YouTube player for background music during reading
- Reader progress tracking with three states: "Currently Reading", "Finished", "Want to Read"
- Direct file rendering from uploaded book files with format-specific viewers
- Responsive, cozy styling consistent with Frictional Fables aesthetic

### Character Notes Viewing Experience
- Dedicated character notes viewing pages that open directly on the website without file downloads
- Inline display support for PDF, image, and video types using embedded viewers similar to the book reader
- PDF character notes render in embedded viewer (iframe or canvas) within the website interface
- Image character notes display with responsive sizing and zoom functionality
- Video character notes play using embedded video player with controls
- Seamless viewing experience for all character note formats within the app interface
- Thematic background design consistent with book reader styling
- Navigation between different character notes for the same book
- Responsive, cozy styling maintaining Frictional Fables aesthetic

### About Section
- Author bio for Kriti with dynamically displayed uploaded author photo with responsive sizing, rounded borders, and subtle shadow for cozy aesthetic
- Instagram link to @frictional_fables
- Brief description of Frictional Fables collection
- Author information updates automatically when admin edits bio content
- Default author photo displays the uploaded IMG_20250128_211711_164.webp image

### Book Pages
Each book includes:
- Dedicated reading interface with thematic styling displaying uploaded PDF or Word document content using appropriate embedded viewers
- Comment section for reader feedback and discussions
- Character notes and behind-the-scenes content with multimedia support (PDFs, images, videos, and text descriptions) that open in dedicated viewing pages
- Progress tracking functionality
- Dynamic book cover display from uploaded images with responsive sizing

### Community Features
- Live Discussion Forum where readers can create posts and reply to discussions
- Suggestions/Requests page with form for user ideas, feedback, and book requests

### Blog Section
- Writing tips and reading recommendations with multimedia content support
- Author interviews and literary content with PDFs, images, videos, and text descriptions
- Blog posts with engaging header design and rich media display
- Each blog entry displays title, description, and associated media files with previews

### Footer
- Social media links (Instagram @frictional_fables)
- Contact information
- Site navigation links

### Main Navigation
- **Settings menu item displayed in the main navigation bar only for admin users with proper visibility control**
- **Settings option accessible exclusively to admin users based on AccessControl.isAdmin authentication check**
- **Non-admin users and guests do not see the Settings menu item in navigation**
- **Proper conditional rendering in Header.tsx ensuring Settings link is visible only when user has admin role**
- **Settings menu item links correctly to SettingsPage.tsx when displayed**
- Consistent styling with other navigation elements

### Settings Page (Admin Only) - FULLY DEPLOYED AND OPERATIONAL
- Settings option in main navigation menu accessible only to admin users and fully functional
- Admin-only access control with authentication verification before displaying content
- Comprehensive content management interface with warm tones and minimal layout
- Organized upload panels with clear labeled sections and live previews:
  - **Books Panel:** Upload book files (PDF or Word documents), cover images, and metadata (title, summary, genre, sort order, character notes)
  - **Blogs Panel:** Upload blog content including PDFs, images, videos, titles, and dedicated text description boxes with preview functionality
  - **Character Notes Panel:** Add and edit multimedia notes tied to specific books with PDF, image, video uploads and dedicated text description boxes
  - **New Comings Panel:** Upload upcoming release images, enter text details (title, description, release date), manage sort order, with full CRUD functionality (create, read, update, delete) and live preview showing how entries will appear on homepage
- Visual cohesion with existing cozy book-themed design
- Live preview functionality for all uploaded content with file type indicators
- Automatic content publishing to corresponding site sections (Featured Books, About, Blog, Character Notes, New Comings)
- User-friendly editing interface with drag-and-drop functionality for all file types
- Real-time preview updates showing how content will appear on the site
- All uploaded content automatically appears in correct sections across the website with appropriate media players and viewers
- Dedicated text description input fields for all blog, character note, and new comings uploads

### Admin Dashboard
- Admin authentication and access control with secure login verification
- Admin-only access to all upload and management functionality
- Dedicated author upload section with intuitive interface featuring:
  - Book file upload (PDF and Word documents) with drag-and-drop or file picker functionality
  - Book cover image upload linked by book ID with thumbnail previews
  - Author photo upload with drag-and-drop support using existing uploadAuthorPhoto function
  - Website logo upload with file picker functionality
  - Progress indicators for all upload operations
  - Thumbnail previews for all uploaded images and file type indicators for documents
- Author bio editing interface with direct text field editing allowing updates to:
  - Author name with autosave functionality
  - Biography text with "Save Changes" button
  - Instagram handle with real-time validation
- Image editing capabilities for uploaded assets:
  - Update/replace functionality for author photo, logo, and book covers
  - Crop functionality for all uploaded images
  - Delete uploaded images with confirmation
- File management interface for uploaded assets with thumbnail grid view and file type organization
- Preview functionality for uploaded content before publishing with media-specific viewers
- Real-time site-wide content updates after saving changes
- Mobile-responsive design consistent with cozy, book-themed styling
- Admin-only access control ensuring only authorized users can access upload section

### Author Book Upload & Customization Panel
- Dedicated section within admin dashboard for comprehensive book management
- Admin-only access with authentication verification
- Book upload interface with metadata fields:
  - Title input field with validation
  - Summary text area with character count
  - Automatic ID generation for new books
  - Genre tags input with tag suggestions
  - Sort order control for Featured Books section positioning
- Multi-format upload functionality:
  - Book file upload (PDF or Word documents) with drag-and-drop support and progress indicators
  - Book cover image upload with thumbnail preview
- Inline image editing tools:
  - Crop functionality for book covers with aspect ratio controls
  - Crop functionality for author photos with circular preview
  - Real-time preview updates during editing
- Live preview panel showing:
  - How book cover and summary will appear in Featured Books section
  - Real-time updates as metadata is edited
  - Mobile and desktop preview modes
- Book management controls:
  - Edit existing book metadata and covers
  - Reorder books in Featured Books section via drag-and-drop
  - Delete books with confirmation dialog
- Responsive design with cozy book-themed styling consistent with site aesthetic
- Form validation and error handling for all input fields

### New Comings Management Panel (Admin Only)
- Dedicated admin-only tab within Settings page for managing upcoming releases with full CRUD functionality
- Authentication verification ensuring only admin users can access New Comings management
- Upload and management interface for upcoming content announcements:
  - Image upload for upcoming releases with drag-and-drop functionality and thumbnail preview
  - Title input field for upcoming release names
  - Text description input field for detailed upcoming release information
  - Release date input field with date picker functionality
  - Sort order control for homepage display priority
- Management controls with full CRUD operations:
  - Create new New Comings entries
  - Edit existing New Comings entries (title, description, image, release date, sort order)
  - Delete entries with confirmation dialog
  - Reorder entries for homepage display priority via drag-and-drop
- Live preview showing how entries will appear in homepage New Comings section with real-time updates
- Automatic publishing to homepage New Comings section when saved
- Responsive design consistent with existing Settings page styling and cozy book-themed aesthetic

## Backend Data Storage

### Books
- Book metadata (title, summary, cover image reference, genre tags, sort order)
- Full book content for web reader (PDF files and Word documents stored as blobs)
- Book file URLs and access endpoints for embedded viewing
- Character notes and behind-the-scenes content with multimedia support (PDFs, images, videos, text descriptions)
- Book cover images stored as blobs with references
- Book availability status and display order
- Unique book ID generation and management
- Genre classification and tagging system
- File type tracking for uploaded book documents with viewer compatibility data

### Character Notes Content
- Character notes with multimedia support (PDFs, images, videos) stored as blobs
- Dedicated text descriptions for each character note entry and associated multimedia files
- Character note metadata and book associations
- File type tracking and preview data for character notes
- Text description storage linked to specific multimedia uploads
- Character note viewing URLs and access endpoints for embedded display

### User Progress
- Reading progress for each user and book
- Reading status (Currently Reading, Finished, Want to Read)

### Community Content
- Forum posts and replies with timestamps
- User comments on books
- Suggestion/request form submissions

### Blog Content
- Blog posts with titles, content, and publication dates
- Author interview content
- Blog multimedia files (PDFs, images, videos) stored as blobs with references
- Blog text descriptions and metadata for each uploaded file
- File type tracking and preview data for blog entries
- Dedicated text description storage for all blog multimedia content

### New Comings Content
- New Comings entries with titles, text descriptions, release dates, and publication information
- Upcoming release images stored as blobs with references
- Timeline and publication date information for upcoming content
- Display order and priority settings for homepage presentation
- Entry metadata and preview data for homepage display
- Sort order management for New Comings showcase positioning

### Author Information
- Author name (editable)
- Biography text (editable)
- Instagram handle (editable)
- Author photo reference with metadata
- Default author photo stored as blob (IMG_20250128_211711_164.webp)

### Admin Assets
- Uploaded book files (PDF and Word documents) stored as blobs with metadata and viewer URLs
- Book cover images stored as blobs with editing metadata
- Author photos stored as blobs with editing metadata using uploadAuthorPhoto function
- Site logo images stored as blobs with editing metadata
- Blog multimedia files (PDFs, images, videos) stored as blobs with metadata and linked text descriptions
- Character notes multimedia files (PDFs, images, videos) stored as blobs with metadata and linked text descriptions for inline viewing
- New Comings images stored as blobs with metadata and linked text descriptions
- Asset metadata and references for dynamic display
- Image editing history and versions
- Asset replacement tracking for automatic updates
- Book metadata storage including genre tags and sort order
- Book ID management and generation system
- File type classification and preview generation
- Document viewer compatibility data for different file formats

### Settings Data
- Settings page upload history and metadata for all file types including New Comings
- Content publishing status for uploaded items
- Cross-reference data linking uploads to site sections
- Multimedia file organization and categorization
- Text description storage for all uploaded multimedia content including New Comings entries
- New Comings management data including CRUD operation history

### Authentication & Authorization
- Admin user authentication and session management
- User role verification for admin-only features including New Comings management
- Access control for all upload and management endpoints
- Secure authentication tokens for admin operations

## Key Functionality

### Dynamic Asset Display
- **Responsive logo display in top-right corner of homepage header that updates when admin uploads new logo, fetched via getSiteAssets() with proper positioning and sizing across all device sizes**
- Author photo display on About page with automatic updates when replaced, featuring responsive sizing, rounded borders, and subtle shadow
- Book cover display in Featured Books section with responsive sizing and custom sort order
- Book content delivery through web reader from uploaded files with format-specific embedded viewers
- Blog multimedia display with appropriate viewers for PDFs, images, and videos alongside text descriptions
- Character notes multimedia display with inline viewing pages using embedded viewers for PDFs, images, and videos
- New Comings display on homepage with uploaded images, titles, descriptions, and release dates in visually cohesive showcase format
- Automatic asset refresh when uploads replace existing files
- Default author photo display using uploaded IMG_20250128_211711_164.webp

### Homepage Preview Sections
- Character Notes preview section displaying recent character note entries with images and short descriptions linking to dedicated viewing pages
- Blogs preview section showcasing latest blog posts with header images and brief excerpts
- New Comings section featuring upcoming releases with preview images, titles, descriptions, and release dates in dynamic showcase format
- Seamless navigation from preview sections to dedicated full content pages
- Consistent styling across all preview sections maintaining cozy book-themed design
- Responsive layout ensuring optimal display on all device sizes

### Character Notes Viewing System
- Dedicated viewing pages for character notes that open directly on the website
- Inline display support for PDF, image, and video character notes using embedded viewers
- PDF character notes render in embedded viewer (iframe or canvas) within website interface
- Image character notes display with responsive sizing and zoom functionality
- Video character notes play using embedded video player with controls
- Format-specific viewer selection based on character note file type
- No external download prompts or file downloads for character notes
- Responsive display with cozy Frictional Fables styling consistent with book reader
- Navigation between character notes within the same book

### Reading System
- Web-based reader interface with embedded viewers for uploaded book files
- PDF rendering in embedded viewer (iframe or canvas) within website interface
- Word document display using inline document viewer (Google Docs viewer or Office web viewer)
- Format-specific viewer selection based on file type
- Progress saving and restoration
- Background music integration via YouTube embeds
- Multi-format content rendering with seamless in-app experience
- No external download prompts or file downloads
- Responsive display with cozy Frictional Fables styling

### Community Interaction
- Comment system for books
- Forum posting and reply system
- Suggestion form submission and storage

### Content Management
- Blog post display and organization with multimedia content support and text descriptions
- Book content delivery through web reader with embedded viewers for all supported formats
- Character notes display with multimedia support and dedicated inline viewing pages
- New Comings content display and management with image, title, description, and release date support
- User progress tracking across sessions
- Dynamic asset loading from blob storage with responsive display
- Real-time content updates across all site sections
- Automatic UI updates when assets are replaced through admin uploads
- Media-specific viewers and players for different file types with accompanying text descriptions

### Settings Page Management - FULLY DEPLOYED AND OPERATIONAL
- Centralized upload interface for all content types including New Comings management accessible through main navigation for admin users only
- Admin authentication verification before allowing access to Settings page and New Comings management
- Automatic content publishing to corresponding site sections (Featured Books, About, Blog, Character Notes, New Comings)
- Live preview functionality for all uploaded content with file type-specific previews
- Organized panel system for different content categories with multimedia support including New Comings panel
- Real-time updates across site when content is uploaded through Settings
- Seamless integration with existing admin functionality
- All uploaded content immediately visible in appropriate website sections with proper media display
- Dedicated text description input fields for all blog, character note, and New Comings multimedia uploads
- Automatic organization of uploaded files under respective sections with appropriate preview components

### Admin Content Management
- Secure admin-only access to all upload and management functionality including New Comings management
- Backend authorization checks for all upload endpoints (books, covers, blogs, character notes, New Comings, assets)
- Intuitive upload interface with drag-and-drop functionality for all file types (PDFs, Word documents, images, videos)
- Comprehensive asset management with thumbnail previews, file type indicators, and progress indicators
- Direct text field editing for author bio with autosave and manual save options
- Image update/replace functionality for all visual assets with confirmation dialogs
- Dynamic content updates across the site with automatic refresh
- Responsive display handling for all uploaded files with mobile optimization
- Multi-format document processing and storage for e-book functionality
- Video and multimedia file processing and storage
- Version control for edited images and content
- Asset replacement system that automatically updates frontend displays
- Admin-only access control with secure authentication
- Mobile-responsive admin interface consistent with book-themed design
- Author photo upload and storage using existing uploadAuthorPhoto backend function
- File type validation and error handling for all supported formats
- Text description management for all multimedia content uploads including New Comings

### Book Upload & Customization Management
- Admin-only access to book management functionality with authentication verification
- Complete book lifecycle management from upload to publication with multi-format support
- Metadata validation and storage for title, summary, genre tags, and sort order
- Inline image cropping with real-time preview updates
- Live preview system showing Featured Books section appearance
- Drag-and-drop reordering of books in Featured Books section
- Genre tagging system with suggestion functionality
- Book ID generation and management for unique identification
- Integration with existing blob storage for PDF, Word document, and image files
- Real-time updates to Featured Books section when changes are saved
- File format validation for supported book formats (PDF, DOC, DOCX)
- Document viewer URL generation for embedded display

### New Comings Management
- Admin-only access to New Comings management functionality with authentication verification
- Full CRUD functionality for upcoming release announcements (create, read, update, delete)
- Upload and management interface for upcoming release content:
  - Image upload with preview functionality for upcoming content
  - Title input and editing with validation
  - Text description editing with real-time preview updates
  - Release date input with date picker functionality
  - Sort order management for homepage display priority
- Entry ordering and priority management for homepage display via drag-and-drop
- Integration with homepage New Comings section for automatic content updates
- Delete and edit functionality for existing New Comings entries with confirmation dialogs
- Live preview showing how entries will appear in homepage showcase format
- Responsive management interface consistent with existing admin styling and cozy book-themed aesthetic

### Authentication & Access Control
- Admin user authentication system with secure login
- Role-based access control for all admin features including New Comings management
- **Frontend UI conditional rendering based on user authentication status with proper Settings menu visibility control**
- **Backend endpoint protection for all upload and management operations including New Comings**
- Session management for admin users
- **Secure authorization checks for Settings page and all admin functionality using AccessControl.isAdmin**
- **Non-admin users cannot access or see admin-only features including Settings menu item in navigation**

## Language
- Application content language: English
