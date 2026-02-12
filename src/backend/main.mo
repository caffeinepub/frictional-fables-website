import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply data migration for upgrade persistence.

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let adminUsername = "Kriti 1";
  let adminPassword = "19.11.2024 Deepika";
  var isAdminSessionActive = false;
  var lastAdminSessionPrincipal : ?Principal = null;
  var accessControlInitialized = false;

  func isCallerAdminSession(caller : Principal) : Bool {
    isAdminSessionActive and lastAdminSessionPrincipal == ?caller;
  };

  func requireAdmin(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  public query ({ caller }) func isCurrentSessionAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

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

  public type UserProfile = {
    name : Text;
    email : Text;
    gender : ?Text;
    bestReads : ?Text;
    profilePicture : ?Storage.ExternalBlob;
    welcomeMessageShown : Bool;
  };

  public type PublicUserProfile = {
    name : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type BookRating = {
    userId : Principal;
    userName : Text;
    rating : Nat;
    timestamp : Int;
  };

  public type BookComment = {
    commentId : Text;
    userId : Principal;
    userName : Text;
    comment : Text;
    timestamp : Int;
    likeCount : Nat;
  };

  public type CommentLike = {
    commentId : Text;
    userId : Principal;
    timestamp : Int;
  };

  public type ForumThread = {
    threadId : Text;
    authorId : Principal;
    authorName : Text;
    authorAvatar : ?Storage.ExternalBlob;
    title : Text;
    message : Text;
    timestamp : Int;
    replyCount : Nat;
    replies : [ForumReply];
  };

  public type ForumReply = {
    replyId : Text;
    threadId : Text;
    authorId : Principal;
    authorName : Text;
    authorAvatar : ?Storage.ExternalBlob;
    message : Text;
    timestamp : Int;
  };

  public type NotificationType = { #comment; #rating; #feedback };

  public type AdminNotification = {
    id : Text;
    notificationType : NotificationType;
    bookTitle : Text;
    userName : Text;
    timestamp : Int;
    isRead : Bool;
  };

  public type Suggestion = {
    id : Text;
    author : Principal;
    authorName : Text;
    authorAvatar : ?Storage.ExternalBlob;
    message : Text;
    timestamp : Int;
  };

  var siteAssets : ?SiteAssets = null;

  let books = Map.empty<Text, BookMetadata>();
  let bookAssets = Map.empty<Text, BookAsset>();
  let characterNotes = Map.empty<Text, CharacterNote>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let newComings = Map.empty<Text, NewComing>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let bookComments = Map.empty<Text, [BookComment]>();
  let bookRatings = Map.empty<Text, [BookRating]>();
  let forumThreads = Map.empty<Text, ForumThread>();
  let forumReplies = Map.empty<Text, ForumReply>();
  let commentLikes = Map.empty<Text, [CommentLike]>();
  let adminNotifications = Map.empty<Text, AdminNotification>();
  let suggestions = Map.empty<Text, Suggestion>();

  func hasCompleteProfile(caller : Principal) : Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.name != "" and profile.email != "";
      };
    };
  };

  func requireCompleteProfile(caller : Principal) {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Please Login and complete Profile to Read and access");
    };
    if (not hasCompleteProfile(caller)) {
      Runtime.trap("Unauthorized: Please Login and complete Profile to Read and access");
    };
  };

  public query ({ caller }) func checkProfileComplete() : async Bool {
    hasCompleteProfile(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Validate name
    if (profile.name == "") {
      Runtime.trap("Name is required");
    };

    // Validate email
    if (profile.email == "") {
      Runtime.trap("Email is required and cannot be empty");
    };

    // Check if email contains "@" and at least one "."
    if (not profile.email.contains(#text "@")) {
      Runtime.trap("Invalid email format. Email must contain an @ symbol");
    };

    if (not profile.email.contains(#text ".")) {
      Runtime.trap("Invalid email format. Email must contain a .");
    };

    switch (profile.profilePicture) {
      case (?pic) {
        if (pic == "") {
          Runtime.trap("Profile picture cannot be empty. Please upload a valid image or leave it blank");
        };
      };
      case (null) {};
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query func getPublicUserProfile(user : Principal) : async ?PublicUserProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          name = profile.name;
          profilePicture = profile.profilePicture;
        };
      };
    };
  };

  public query ({ caller }) func getAllUserProfilesWithPrincipals() : async [(Principal, UserProfile)] {
    requireAdmin(caller);
    userProfiles.toArray();
  };

  public shared ({ caller }) func uploadLogo(logo : Storage.ExternalBlob) : async () {
    requireAdmin(caller);

    if (logo == "") {
      Runtime.trap("Logo cannot be empty");
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

  public shared ({ caller }) func uploadAuthorPhoto(photo : Storage.ExternalBlob) : async () {
    requireAdmin(caller);

    if (photo == "") {
      Runtime.trap("Author photo cannot be empty");
    };

    let emptyBlob : Storage.ExternalBlob = "";
    let existingAssets = switch (siteAssets) {
      case (null) { { authorPhoto = photo; logo = emptyBlob } };
      case (?assets) { { assets with authorPhoto = photo } };
    };
    siteAssets := ?existingAssets;
  };

  public shared ({ caller }) func addBook(
    id : Text,
    title : Text,
    summary : Text,
    genre : Text,
    sortOrder : Nat,
    coverImage : Storage.ExternalBlob,
  ) : async () {
    requireAdmin(caller);

    if (id == "" or title == "" or summary == "") {
      Runtime.trap("Book ID, title, and summary are required");
    };

    if (coverImage == "") {
      Runtime.trap("Book cover image is required");
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
    requireAdmin(caller);

    if (id == "" or title == "" or summary == "") {
      Runtime.trap("Book ID, title, and summary are required");
    };

    if (coverImage == "") {
      Runtime.trap("Book cover image is required");
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
    requireAdmin(caller);

    if (id == "") {
      Runtime.trap("Book ID is required");
    };

    switch (books.get(id)) {
      case (null) {
        Runtime.trap("Book not found: " # id);
      };
      case (?_) {
        books.remove(id);
        bookAssets.remove(id);
      };
    };
  };

  public query func getBook(id : Text) : async ?BookMetadata {
    books.get(id);
  };

  public query func getAllBooks() : async [BookMetadata] {
    books.values().toArray();
  };

  public shared ({ caller }) func uploadBookFile(
    bookId : Text,
    file : Storage.ExternalBlob,
    fileType : BookFileType,
  ) : async () {
    requireAdmin(caller);

    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    if (file == "") {
      Runtime.trap("Book file cannot be empty");
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
    requireAdmin(caller);

    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    if (image == "") {
      Runtime.trap("Book cover image cannot be empty");
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

  public query ({ caller }) func getBookAssets(bookId : Text) : async ?BookAsset {
    requireCompleteProfile(caller);
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

  public shared ({ caller }) func addCharacterNote(
    id : Text,
    bookId : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?CharacterNoteFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    requireAdmin(caller);

    if (id == "" or bookId == "" or title == "") {
      Runtime.trap("Character note ID, book ID, and title are required");
    };

    switch (file) {
      case (?f) {
        if (f == "") {
          Runtime.trap("Character note file cannot be empty if provided");
        };
      };
      case (null) {};
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
    requireAdmin(caller);

    if (id == "" or bookId == "" or title == "") {
      Runtime.trap("Character note ID, book ID, and title are required");
    };

    switch (file) {
      case (?f) {
        if (f == "") {
          Runtime.trap("Character note file cannot be empty if provided");
        };
      };
      case (null) {};
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

  public query ({ caller }) func getCharacterNote(id : Text) : async ?CharacterNote {
    requireCompleteProfile(caller);
    characterNotes.get(id);
  };

  public query func getAllCharacterNotes() : async [CharacterNote] {
    characterNotes.values().toArray();
  };

  public query func getCharacterNotesByBook(bookId : Text) : async [CharacterNote] {
    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    let allNotes = characterNotes.values().toArray();
    allNotes.filter(func(note) { note.bookId == bookId });
  };

  public shared ({ caller }) func deleteCharacterNote(id : Text) : async () {
    requireAdmin(caller);

    if (id == "") {
      Runtime.trap("Character note ID is required");
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

  public shared ({ caller }) func addBlogPost(
    id : Text,
    title : Text,
    description : Text,
    file : ?Storage.ExternalBlob,
    fileType : ?BlogFileType,
    previewImage : ?Storage.ExternalBlob,
  ) : async () {
    requireAdmin(caller);

    if (id == "" or title == "") {
      Runtime.trap("Blog post ID and title are required");
    };

    switch (file) {
      case (?f) {
        if (f == "") {
          Runtime.trap("Blog file cannot be empty if provided");
        };
      };
      case (null) {};
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
    requireAdmin(caller);

    if (id == "" or title == "") {
      Runtime.trap("Blog post ID and title are required");
    };

    switch (file) {
      case (?f) {
        if (f == "") {
          Runtime.trap("Blog file cannot be empty if provided");
        };
      };
      case (null) {};
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

  public query ({ caller }) func getBlogPost(id : Text) : async ?BlogPost {
    requireCompleteProfile(caller);
    blogPosts.get(id);
  };

  public query func getAllBlogPosts() : async [BlogPost] {
    blogPosts.values().toArray();
  };

  public shared ({ caller }) func deleteBlogPost(id : Text) : async () {
    requireAdmin(caller);

    if (id == "") {
      Runtime.trap("Blog post ID is required");
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
    requireAdmin(caller);

    if (id == "" or title == "") {
      Runtime.trap("New coming ID and title are required");
    };

    if (image == "") {
      Runtime.trap("New coming image is required");
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
    requireAdmin(caller);

    if (id == "" or title == "") {
      Runtime.trap("New coming ID and title are required");
    };

    if (image == "") {
      Runtime.trap("New coming image is required");
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
    requireAdmin(caller);

    if (id == "") {
      Runtime.trap("New coming ID is required");
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

  public shared ({ caller }) func addBookComment(bookId : Text, comment : Text) : async () {
    requireCompleteProfile(caller);

    if (bookId == "" or comment == "") {
      Runtime.trap("Book ID and comment are required");
    };

    switch (books.get(bookId)) {
      case (null) {
        Runtime.trap("Book not found: " # bookId);
      };
      case (?_) {
        let userName = switch (userProfiles.get(caller)) {
          case (?profile) { profile.name };
          case (null) { "Unknown" };
        };

        let commentId = Time.now().toText();
        let newComment : BookComment = {
          commentId;
          userId = caller;
          userName;
          comment;
          timestamp = Time.now();
          likeCount = 0;
        };

        let existingComments = switch (bookComments.get(bookId)) {
          case (null) { [newComment] };
          case (?comments) {
            [newComment].concat(comments);
          };
        };

        bookComments.add(bookId, existingComments);

        let notificationId = Time.now().toText() # "_comment";
        let bookTitle = switch (books.get(bookId)) {
          case (null) { "Unknown Book" };
          case (?book) { book.title };
        };

        let notification : AdminNotification = {
          id = notificationId;
          notificationType = #comment;
          bookTitle;
          userName;
          timestamp = Time.now();
          isRead = false;
        };
        adminNotifications.add(notificationId, notification);
      };
    };
  };

  public query func getBookComments(bookId : Text) : async [BookComment] {
    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    switch (bookComments.get(bookId)) {
      case (null) { [] };
      case (?comments) { comments };
    };
  };

  public shared ({ caller }) func likeComment(commentId : Text) : async () {
    requireCompleteProfile(caller);

    if (commentId == "") {
      Runtime.trap("Comment ID is required");
    };

    let userAlreadyLiked = switch (commentLikes.get(commentId)) {
      case (null) { false };
      case (?likes) {
        likes.any(func(like) { like.userId == caller });
      };
    };

    if (userAlreadyLiked) {
      Runtime.trap("You have already liked this comment; only one like per user is allowed");
    };

    var commentFound = false;
    for ((bookId, comments) in bookComments.entries()) {
      let updatedComments = comments.map(
        func(comment) {
          if (comment.commentId == commentId) {
            commentFound := true;
            { comment with likeCount = comment.likeCount + 1 };
          } else {
            comment;
          };
        }
      );
      if (commentFound) {
        commentLikes.add(
          commentId,
          (
            switch (commentLikes.get(commentId)) {
              case (null) { [] };
              case (?likes) { likes };
            }
          ).concat(
            [{
              commentId;
              userId = caller;
              timestamp = Time.now();
            }],
          ),
        );
        bookComments.add(bookId, updatedComments);
        return;
      };
    };

    Runtime.trap("Comment not found: " # commentId);
  };

  public query func getCommentLikeCount(commentId : Text) : async Nat {
    if (commentId == "") {
      Runtime.trap("Comment ID is required");
    };

    for ((_, comments) in bookComments.entries()) {
      let foundComment = comments.find(func(comment) { comment.commentId == commentId });
      switch (foundComment) {
        case (null) {};
        case (?comment) { return comment.likeCount };
      };
    };

    Runtime.trap("Comment not found: " # commentId);
  };

  public shared ({ caller }) func addBookRating(
    bookId : Text,
    rating : Nat,
  ) : async () {
    requireCompleteProfile(caller);

    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    switch (books.get(bookId)) {
      case (null) {
        Runtime.trap("Book not found: " # bookId);
      };
      case (?_) {
        if (rating < 1 or rating > 5) {
          Runtime.trap("Rating must be between 1 and 5 stars");
        };

        let userName = switch (userProfiles.get(caller)) {
          case (?profile) { profile.name };
          case (null) { "Unknown" };
        };

        let newRating : BookRating = {
          userId = caller;
          userName;
          rating;
          timestamp = Time.now();
        };

        let hasExistingRating = switch (bookRatings.get(bookId)) {
          case (null) { false };
          case (?existingRatings) {
            existingRatings.any(func(existingRating) { existingRating.userId == caller });
          };
        };

        if (hasExistingRating) {
          Runtime.trap("You have already rated this book");
        };

        let allRatings = switch (bookRatings.get(bookId)) {
          case (null) { [newRating] };
          case (?existingRatings) {
            [newRating].concat(existingRatings);
          };
        };

        bookRatings.add(bookId, allRatings);

        let notificationId = Time.now().toText() # "_rating";
        let bookTitle = switch (books.get(bookId)) {
          case (null) { "Unknown Book" };
          case (?book) { book.title };
        };

        let notification : AdminNotification = {
          id = notificationId;
          notificationType = #rating;
          bookTitle;
          userName;
          timestamp = Time.now();
          isRead = false;
        };
        adminNotifications.add(notificationId, notification);
      };
    };
  };

  public query func getBookRatings(bookId : Text) : async [BookRating] {
    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    switch (bookRatings.get(bookId)) {
      case (null) { [] };
      case (?ratings) { ratings };
    };
  };

  public query func getBookAverageRating(bookId : Text) : async ?Float {
    if (bookId == "") {
      Runtime.trap("Book ID is required");
    };

    switch (bookRatings.get(bookId)) {
      case (null) { null };
      case (?ratings) {
        if (ratings.size() == 0) { return null };

        let ratingsFloats = ratings.map(func(rating) { rating.rating.toInt().toFloat() });

        let sum : Float = ratingsFloats.foldLeft(0.0, func(acc, r) { acc + r });

        ?(sum / (ratingsFloats.size().toInt().toFloat()));
      };
    };
  };

  public shared ({ caller }) func createThread(title : Text, message : Text) : async () {
    requireCompleteProfile(caller);

    if (title == "" or message == "") {
      Runtime.trap("Thread title and message are required");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    let threadId = Time.now().toText();
    let newThread : ForumThread = {
      threadId;
      authorId = caller;
      authorName = userProfile.name;
      authorAvatar = userProfile.profilePicture;
      title;
      message;
      timestamp = Time.now();
      replyCount = 0;
      replies = [];
    };

    forumThreads.add(threadId, newThread);
  };

  public shared ({ caller }) func replyToThread(threadId : Text, message : Text) : async () {
    requireCompleteProfile(caller);

    if (threadId == "" or message == "") {
      Runtime.trap("Thread ID and reply message are required");
    };

    switch (forumThreads.get(threadId)) {
      case (null) {
        Runtime.trap("Thread not found: " # threadId);
      };
      case (?thread) {
        let userProfile = switch (userProfiles.get(caller)) {
          case (?profile) { profile };
          case (null) {
            Runtime.trap("User profile not found");
          };
        };

        let replyId = Time.now().toText();
        let newReply : ForumReply = {
          replyId;
          threadId;
          authorId = caller;
          authorName = userProfile.name;
          authorAvatar = userProfile.profilePicture;
          message;
          timestamp = Time.now();
        };

        let updatedReplies = [newReply].concat(thread.replies);

        let updatedThread : ForumThread = { thread with replyCount = thread.replyCount + 1; replies = updatedReplies };

        forumThreads.add(threadId, updatedThread);
        forumReplies.add(replyId, newReply);
      };
    };
  };

  // Forum feed (open to all)
  public query func getAllThreadsWithReplies() : async [ForumThread] {
    let allThreads = forumThreads.values().toArray();

    allThreads.sort(
      func(a, b) {
        Nat.compare(b.timestamp.toNat(), a.timestamp.toNat());
      }
    );
  };

  // Get thread + replies (open to all)
  public query func getThreadWithReplies(threadId : Text) : async ?ForumThread {
    forumThreads.get(threadId);
  };

  // Get thread replies (open to all)
  public query func getRepliesByThread(threadId : Text) : async [ForumReply] {
    if (threadId == "") {
      Runtime.trap("Thread ID is required");
    };

    switch (forumThreads.get(threadId)) {
      case (null) {
        Runtime.trap("Thread not found: " # threadId);
      };
      case (?thread) { thread.replies };
    };
  };

  public query ({ caller }) func getReplyById(replyId : Text) : async ?ForumReply {
    requireCompleteProfile(caller);
    forumReplies.get(replyId);
  };

  public query ({ caller }) func countRepliesByThread(threadId : Text) : async Nat {
    requireCompleteProfile(caller);

    if (threadId == "") {
      Runtime.trap("Thread ID is required");
    };

    switch (forumThreads.get(threadId)) {
      case (null) {
        Runtime.trap("Thread not found: " # threadId);
      };
      case (?thread) { thread.replyCount };
    };
  };

  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async Bool {
    if (username == "") {
      Runtime.trap("Username is required");
    };

    if (password == "") {
      Runtime.trap("Password is required");
    };

    let trimmedUsername = username.trim(#char(' '));
    let trimmedPassword = password.trim(#char(' '));

    if (trimmedUsername == adminUsername and trimmedPassword == adminPassword) {
      isAdminSessionActive := true;
      lastAdminSessionPrincipal := ?caller;
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      return true;
    };

    false;
  };

  public shared ({ caller }) func adminLogout() : async Bool {
    if (isAdminSessionActive and lastAdminSessionPrincipal == ?caller) {
      isAdminSessionActive := false;
      lastAdminSessionPrincipal := null;
      return true;
    };
    false;
  };

  // New createSuggestion function
  public shared ({ caller }) func createSuggestion(message : Text) : async () {
    requireCompleteProfile(caller);

    if (message == "") {
      Runtime.trap("Suggestion message cannot be empty");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    let suggestionId = Time.now().toText();

    let newSuggestion : Suggestion = {
      id = suggestionId;
      author = caller;
      authorName = userProfile.name;
      authorAvatar = userProfile.profilePicture;
      message;
      timestamp = Time.now();
    };

    suggestions.add(suggestionId, newSuggestion);
  };

  // Suggestions feed (open to all)
  public query func getSuggestionsFeed() : async [Suggestion] {
    let allSuggestions = suggestions.values().toArray();

    allSuggestions.sort(
      func(a, b) {
        Nat.compare(b.timestamp.toNat(), a.timestamp.toNat());
      }
    );
  };
};
