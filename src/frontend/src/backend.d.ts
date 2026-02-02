import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface BlogPost {
    id: string;
    previewImage?: ExternalBlob;
    title: string;
    file?: ExternalBlob;
    description: string;
    fileType?: BlogFileType;
}
export interface UserProfile {
    name: string;
}
export interface NewComing {
    id: string;
    title: string;
    sortOrder: bigint;
    description: string;
    image: ExternalBlob;
    releaseDate?: string;
}
export interface CharacterNote {
    id: string;
    previewImage?: ExternalBlob;
    title: string;
    file?: ExternalBlob;
    description: string;
    bookId: string;
    fileType?: CharacterNoteFileType;
}
export interface SiteAssets {
    logo: ExternalBlob;
    authorPhoto: ExternalBlob;
}
export interface BookMetadata {
    id: string;
    title: string;
    sortOrder: bigint;
    coverImage: ExternalBlob;
    summary: string;
    genre: string;
}
export interface BookAsset {
    id: string;
    bookFile: ExternalBlob;
    fileType: BookFileType;
    coverImage: ExternalBlob;
}
export enum BookFileType {
    pdf = "pdf",
    wordDoc = "wordDoc",
    wordDocx = "wordDocx"
}
export enum CharacterNoteFileType {
    pdf = "pdf",
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBlogPost(id: string, title: string, description: string, file: ExternalBlob | null, fileType: BlogFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    addBook(id: string, title: string, summary: string, genre: string, sortOrder: bigint, coverImage: ExternalBlob): Promise<void>;
    addCharacterNote(id: string, bookId: string, title: string, description: string, file: ExternalBlob | null, fileType: CharacterNoteFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    addNewComing(id: string, title: string, description: string, image: ExternalBlob, releaseDate: string | null, sortOrder: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBlogPost(id: string): Promise<void>;
    deleteBook(id: string): Promise<void>;
    deleteCharacterNote(id: string): Promise<void>;
    deleteNewComing(id: string): Promise<void>;
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    getAllCharacterNotes(): Promise<Array<CharacterNote>>;
    getAllNewComings(): Promise<Array<NewComing>>;
    getBlogPost(id: string): Promise<BlogPost | null>;
    getBookAssets(bookId: string): Promise<BookAsset | null>;
    getBooksInFeaturedOrder(): Promise<Array<BookMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacterNote(id: string): Promise<CharacterNote | null>;
    getNewComing(id: string): Promise<NewComing | null>;
    getSiteAssets(): Promise<SiteAssets | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBlogPost(id: string, title: string, description: string, file: ExternalBlob | null, fileType: BlogFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    updateBook(id: string, title: string, summary: string, genre: string, sortOrder: bigint, coverImage: ExternalBlob): Promise<void>;
    updateCharacterNote(id: string, bookId: string, title: string, description: string, file: ExternalBlob | null, fileType: CharacterNoteFileType | null, previewImage: ExternalBlob | null): Promise<void>;
    updateNewComing(id: string, title: string, description: string, image: ExternalBlob, releaseDate: string | null, sortOrder: bigint): Promise<void>;
    uploadBookCover(bookId: string, image: ExternalBlob): Promise<void>;
    uploadBookFile(bookId: string, file: ExternalBlob, fileType: BookFileType): Promise<void>;
    uploadLogo(logo: ExternalBlob): Promise<void>;
}
