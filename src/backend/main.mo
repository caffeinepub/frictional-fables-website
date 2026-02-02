import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type BookMetadata = {
    id : Text;
    title : Text;
    summary : Text;
    genre : Text;
    sortOrder : Nat;
    coverImage : Storage.ExternalBlob;
  };

  public type BookAsset = {
    id : Text;
    bookFile : Storage.ExternalBlob;
    coverImage : Storage.ExternalBlob;
    fileType : BookFileType;
  };

  public type CharacterNote = {
    id : Text;
    bookId : Text;
    title : Text;
    description : Text;
    file : ?Storage.ExternalBlob;
    fileType : ?CharacterNoteFileType;
    previewImage : ?Storage.ExternalBlob;
  };

  public type BlogPost = {
    id : Text;
    title : Text;
    description : Text;
    file : ?Storage.ExternalBlob;
    fileType : ?BlogFileType;
    previewImage : ?Storage.ExternalBlob;
  };

  public type NewComing = {
    id : Text;
    title : Text;
    description : Text;
    image : Storage.ExternalBlob;
    releaseDate : ?Text;
    sortOrder : Nat;
  };

  public type SiteAssets = {
    authorPhoto : Storage.ExternalBlob;
    logo : Storage.ExternalBlob;
  };

  public type BookFileType = { #pdf; #wordDoc; #wordDocx };
  public type CharacterNoteFileType = { #pdf; #image; #video };
  public type BlogFileType = { #pdf; #image; #video };

  var siteAssets : ?SiteAssets = null;

  let books = Map.empty<Text, BookMetadata>();
  let bookAssets = Map.empty<Text, BookAsset>();
  let characterNotes = Map.empty<Text, CharacterNote>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let newComings = Map.empty<Text, NewComing>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public type UserProfile = {
    name : Text;
  };

  // User profile functions - properly protected
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Site assets - admin only for upload, public for read
  public shared ({ caller }) func uploadLogo(logo : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload logo");
    };
    let emptyBlob : Storage.ExternalBlob = "";
    let existingAssets = switch (siteAssets) {
      case (null) { { authorPhoto = emptyBlob; logo } };
      case (?assets) { { assets with logo } };
    };
    siteAssets := ?existingAssets;
  };

  public query func getSiteAssets() : async ?SiteAssets {
    siteAssets;
  };

  // Book management - admin only for modifications, public for reads
  public shared ({ caller }) func addBook(
    id : Text,
    title : Text,
    summary : Text,
    genre : Text,
    sortOrder : Nat,
    coverImage : Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };
    let newBook : BookMetadata = {
      id;
      title;
      summary;
      genre;
      sortOrder;
      coverImage;
    };
    books.add(id, newBook);
  };

  public shared ({ caller }) func updateBook(
    id : Text,
    title : Text,
    summary : Text,
    genre : Text,
    sortOrder : Nat,
    coverImage : Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };
    switch (books.get(id)) {
      case (null) {
        Runtime.trap("Book not found: " # id);
      };
      case (?_) {
        let newBook : BookMetadata = {
          id;
          title;
          summary;
          genre;
          sortOrder;
          coverImage;
        };
        books.add(id, newBook);
      };
    };
  };

  public shared ({ caller }) func deleteBook(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    switch (books.get(id)) {
      case (null) {
        Runtime.trap("Book not found: " # id);
      };
      case (?_) {
        books.remove(id);
      };
    };
  };

  public shared ({ caller }) func uploadBookFile(
    bookId : Text,
    file : Storage.ExternalBlob,
    fileType : BookFileType,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload books");
    };
    let emptyBlob : Storage.ExternalBlob = "";
    let existingAsset = switch (bookAssets.get(bookId)) {
      case (null) {
        {
          id = bookId;
          bookFile = file;
          coverImage = emptyBlob;
          fileType;
        };
      };
      case (?asset) { { asset with bookFile = file; fileType } };
    };
    bookAssets.add(bookId, existingAsset);
  };

  public shared ({ caller }) func uploadBookCover(
    bookId : Text,
    image : Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload book covers");
    };
    let emptyBlob : Storage.ExternalBlob = "";
    let existingAsset = switch (bookAssets.get(bookId)) {
      case (null) {
        {
          id = bookId;
          bookFile = emptyBlob;
          coverImage = image;
          fileType = #pdf;
        };
      };
      case (?asset) { { asset with coverImage = image } };
    };
    bookAssets.add(bookId, existingAsset);
  };

  public query func getBookAssets(bookId : Text) : async ?BookAsset {
    bookAssets.get(bookId);
  };

  func compareBooksBySortOrder(a : BookMetadata, b : BookMetadata) : { #less; #equal; #greater } {
    Nat.compare(a.sortOrder, b.sortOrder);
  };

  public query func getBooksInFeaturedOrder() : async [BookMetadata] {
    let mutableBooksArray = books.toArray();
    let bookValuesArray = mutableBooksArray.map(func(entry) { entry.1 });
    bookValuesArray.sort(
      compareBooksBySortOrder
    );
  };

  // Character notes - admin only for modifications, public for reads
  public shared ({ caller }) func addCharacterNote(
    id : Text,
    bookId : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?CharacterNoteFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add character notes");
    };
    let newNote : CharacterNote = {
      id;
      bookId;
      title;
      description;
      file;
      fileType;
      previewImage;
    };
    characterNotes.add(id, newNote);
  };

  public shared ({ caller }) func updateCharacterNote(
    id : Text,
    bookId : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?CharacterNoteFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update character notes");
    };
    switch (characterNotes.get(id)) {
      case (null) {
        Runtime.trap("Character note not found: " # id);
      };
      case (?_) {
        let updatedNote : CharacterNote = {
          id;
          bookId;
          title;
          description;
          file;
          fileType;
          previewImage;
        };
        characterNotes.add(id, updatedNote);
      };
    };
  };

  public query func getCharacterNote(id : Text) : async ?CharacterNote {
    characterNotes.get(id);
  };

  public query func getAllCharacterNotes() : async [CharacterNote] {
    characterNotes.values().toArray();
  };

  public shared ({ caller }) func deleteCharacterNote(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete character notes");
    };
    switch (characterNotes.get(id)) {
      case (null) {
        Runtime.trap("Character note not found: " # id);
      };
      case (?_) {
        characterNotes.remove(id);
      };
    };
  };

  // Blogs - admin only for modifications, public for reads
  public shared ({ caller }) func addBlogPost(
    id : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?BlogFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add blog posts");
    };
    let newPost : BlogPost = {
      id;
      title;
      description;
      file;
      fileType;
      previewImage;
    };
    blogPosts.add(id, newPost);
  };

  public shared ({ caller }) func updateBlogPost(
    id : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?BlogFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found: " # id);
      };
      case (?_) {
        let updatedPost : BlogPost = {
          id;
          title;
          description;
          file;
          fileType;
          previewImage;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  public query func getBlogPost(id : Text) : async ?BlogPost {
    blogPosts.get(id);
  };

  public query func getAllBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public shared ({ caller }) func deleteBlogPost(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete blog posts");
    };
    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found: " # id);
      };
      case (?_) {
        blogPosts.remove(id);
      };
    };
  };

  // New Comings - admin only for modifications, public for reads
  func compareNewComingsBySortOrder(a : NewComing, b : NewComing) : { #less; #equal; #greater } {
    Nat.compare(a.sortOrder, b.sortOrder);
  };

  public shared ({ caller }) func addNewComing(
    id : Text,
    title : Text,
    description : Text,
    image : Storage.ExternalBlob,
    releaseDate : ?Text,
    sortOrder : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add new comings");
    };
    let newComing : NewComing = {
      id;
      title;
      description;
      image;
      releaseDate;
      sortOrder;
    };
    newComings.add(id, newComing);
  };

  public shared ({ caller }) func updateNewComing(
    id : Text,
    title : Text,
    description : Text,
    image : Storage.ExternalBlob,
    releaseDate : ?Text,
    sortOrder : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update new comings");
    };
    switch (newComings.get(id)) {
      case (null) {
        Runtime.trap("New coming not found: " # id);
      };
      case (?_) {
        let updatedComing : NewComing = {
          id;
          title;
          description;
          image;
          releaseDate;
          sortOrder;
        };
        newComings.add(id, updatedComing);
      };
    };
  };

  public query func getAllNewComings() : async [NewComing] {
    let mutableArray = newComings.toArray();
    let comingsArray = mutableArray.map(func(entry) { entry.1 });
    comingsArray.sort(
      compareNewComingsBySortOrder
    );
  };

  public query func getNewComing(id : Text) : async ?NewComing {
    newComings.get(id);
  };

  public shared ({ caller }) func deleteNewComing(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete new comings");
    };
    switch (newComings.get(id)) {
      case (null) {
        Runtime.trap("New coming not found: " # id);
      };
      case (?_) {
        newComings.remove(id);
      };
    };
  };
};
