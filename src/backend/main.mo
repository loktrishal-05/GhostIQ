import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type AnalysisInput = {
    replyDelay : Nat;
    seenIgnoredFrequency : Nat;
    messageLengthReduction : Nat;
    initiationRatio : Nat;
    toneChange : Nat;
    socialMediaActivity : Nat;
    recentMessage : Text;
  };

  type AnalysisRecord = {
    id : Text;
    date : Int;
    score : Nat;
    riskCategory : Text;
    sentimentResult : Text;
    inputData : AnalysisInput;
  };

  type UserProfile = {
    principalId : Text;
    createdAt : Int;
    analysisHistory : [AnalysisRecord];
  };

  type FrontendUserProfile = {
    name : Text;
  };

  module AnalysisRecord {
    public func compareByScore(record1 : AnalysisRecord, record2 : AnalysisRecord) : Order.Order {
      Nat.compare(record1.score, record2.score);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let frontendUserProfiles = Map.empty<Principal, FrontendUserProfile>();

  func getCallerProfile(caller : Principal) : ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?FrontendUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    frontendUserProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?FrontendUserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    frontendUserProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : FrontendUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    frontendUserProfiles.add(caller, profile);
  };

  public shared ({ caller }) func registerUser() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };
    switch (getCallerProfile(caller)) {
      case (?_) { "already_exists" };
      case (null) {
        let newUser : UserProfile = {
          principalId = caller.toText();
          createdAt = Time.now();
          analysisHistory = [];
        };
        userProfiles.add(caller, newUser);
        "ok";
      };
    };
  };

  public query ({ caller }) func getUser() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user data");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveAnalysis(record : AnalysisRecord) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save analyses");
    };
    let userObj = switch (getCallerProfile(caller)) {
      case (?user) { user };
      case (null) {
        {
          principalId = caller.toText();
          createdAt = Time.now();
          analysisHistory = [];
        };
      };
    };
    let historyList = List.fromArray<AnalysisRecord>(userObj.analysisHistory);
    historyList.add(record);
    let updatedUser : UserProfile = {
      principalId = userObj.principalId;
      createdAt = userObj.createdAt;
      analysisHistory = historyList.toArray();
    };
    userProfiles.add(caller, updatedUser);
    "ok";
  };

  public query ({ caller }) func getHistory() : async [AnalysisRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view history");
    };
    switch (getCallerProfile(caller)) {
      case (?user) { user.analysisHistory };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deleteAnalysis(id : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete analyses");
    };
    switch (getCallerProfile(caller)) {
      case (null) { Runtime.trap("No user profile found") };
      case (?user) {
        let filteredHistory = user.analysisHistory.filter(
          func(record) { record.id != id }
        );
        if (filteredHistory.size() == user.analysisHistory.size()) {
          "not_found";
        } else {
          let updatedUser : UserProfile = {
            principalId = user.principalId;
            createdAt = user.createdAt;
            analysisHistory = filteredHistory;
          };
          userProfiles.add(caller, updatedUser);
          "ok";
        };
      };
    };
  };

  public query ({ caller }) func getStats() : async {
    totalAnalyses : Nat;
    averageScore : Nat;
    highestScore : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };
    switch (getCallerProfile(caller)) {
      case (null) {
        { totalAnalyses = 0; averageScore = 0; highestScore = 0 };
      };
      case (?user) {
        let history = user.analysisHistory;
        if (history.size() == 0) {
          { totalAnalyses = 0; averageScore = 0; highestScore = 0 };
        } else {
          var totalScore = 0;
          var highestScore = history[0].score;
          for (record in history.values()) {
            if (record.score > highestScore) {
              highestScore := record.score;
            };
            totalScore += record.score;
          };
          let averageScore = totalScore / history.size();
          {
            totalAnalyses = history.size();
            averageScore;
            highestScore;
          };
        };
      };
    };
  };
};
