import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";

actor {
  // Data Types
  type UserProfile = {
    userId : Text;
    name : Text;
    dob : Text;
    createdAt : Text;
  };

  type StudyTopic = {
    id : Text;
    subject : Text;
    topicName : Text;
    timeTargetMinutes : Nat;
    status : Text;
    createdAt : Text;
  };

  type GymActivity = {
    id : Text;
    description : Text;
    estimatedCalories : Nat;
    muscleGroups : Text;
    createdAt : Text;
  };

  type NutritionEntry = {
    id : Text;
    description : Text;
    estimatedCalories : Nat;
    protein : Text;
    sugar : Text;
    createdAt : Text;
  };

  type DailyGoals = {
    sleepDone : Bool;
    nmbDone : Bool;
    schoolDone : Bool;
  };

  type MeasurementRecord = {
    weeklyMeasurementDate : Text;
    monthlyMeasurementDate : Text;
  };

  // Global Storage
  let users = Map.empty<Text, UserProfile>();
  let studyTopics = Map.empty<Text, Map.Map<Text, List.List<StudyTopic>>>();
  let gymActivities = Map.empty<Text, Map.Map<Text, List.List<GymActivity>>>();
  let nutritionEntries = Map.empty<Text, Map.Map<Text, List.List<NutritionEntry>>>();
  let dailyGoals = Map.empty<Text, Map.Map<Text, DailyGoals>>();
  let streaks = Map.empty<Text, Nat>();
  let measurements = Map.empty<Text, MeasurementRecord>();

  module StudyTopic {
    public func compareByCreatedAt(a : StudyTopic, b : StudyTopic) : Order.Order {
      Text.compare(a.createdAt, b.createdAt);
    };
  };

  module GymActivity {
    public func compareByCreatedAt(a : GymActivity, b : GymActivity) : Order.Order {
      Text.compare(a.createdAt, b.createdAt);
    };
  };

  module NutritionEntry {
    public func compareByCreatedAt(a : NutritionEntry, b : NutritionEntry) : Order.Order {
      Text.compare(a.createdAt, b.createdAt);
    };
  };

  func getUserId(name : Text, dob : Text) : Text {
    name # dob;
  };

  // User Auth — returns "" when user not found (no trap)
  public shared func register(name : Text, dob : Text, createdAt : Text) : async Text {
    let userId = getUserId(name, dob);
    switch (users.get(userId)) {
      case (null) {
        let profile : UserProfile = { userId; name; dob; createdAt };
        users.add(userId, profile);
        userId;
      };
      case (?existing) { existing.userId }; // already registered, return userId
    };
  };

  public shared func login(name : Text, dob : Text) : async Text {
    let userId = getUserId(name, dob);
    switch (users.get(userId)) {
      case (null) { "" }; // not found — return empty so frontend can register
      case (?_) { userId };
    };
  };

  // Study Topics
  public shared func addStudyTopic(userId : Text, date : Text, topic : StudyTopic) : async () {
    let userTopics = switch (studyTopics.get(userId)) {
      case (null) { Map.empty<Text, List.List<StudyTopic>>() };
      case (?map) { map };
    };
    let dayTopics = switch (userTopics.get(date)) {
      case (null) { List.empty<StudyTopic>() };
      case (?list) { list };
    };
    dayTopics.add(topic);
    userTopics.add(date, dayTopics);
    studyTopics.add(userId, userTopics);
  };

  public query func getStudyTopics(userId : Text, date : Text) : async [StudyTopic] {
    switch (studyTopics.get(userId)) {
      case (null) { [] };
      case (?userTopics) {
        switch (userTopics.get(date)) {
          case (null) { [] };
          case (?dayTopics) { dayTopics.toArray().sort(StudyTopic.compareByCreatedAt) };
        };
      };
    };
  };

  // Gym Activities
  public shared func addGymActivity(userId : Text, date : Text, activity : GymActivity) : async () {
    let userActivities = switch (gymActivities.get(userId)) {
      case (null) { Map.empty<Text, List.List<GymActivity>>() };
      case (?map) { map };
    };
    let dayActivities = switch (userActivities.get(date)) {
      case (null) { List.empty<GymActivity>() };
      case (?list) { list };
    };
    dayActivities.add(activity);
    userActivities.add(date, dayActivities);
    gymActivities.add(userId, userActivities);
  };

  public query func getGymActivities(userId : Text, date : Text) : async [GymActivity] {
    switch (gymActivities.get(userId)) {
      case (null) { [] };
      case (?userActivities) {
        switch (userActivities.get(date)) {
          case (null) { [] };
          case (?dayActivities) { dayActivities.toArray().sort(GymActivity.compareByCreatedAt) };
        };
      };
    };
  };

  // Nutrition Entries
  public shared func addNutritionEntry(userId : Text, date : Text, entry : NutritionEntry) : async () {
    let userEntries = switch (nutritionEntries.get(userId)) {
      case (null) { Map.empty<Text, List.List<NutritionEntry>>() };
      case (?map) { map };
    };
    let dayEntries = switch (userEntries.get(date)) {
      case (null) { List.empty<NutritionEntry>() };
      case (?list) { list };
    };
    dayEntries.add(entry);
    userEntries.add(date, dayEntries);
    nutritionEntries.add(userId, userEntries);
  };

  public query func getNutritionEntries(userId : Text, date : Text) : async [NutritionEntry] {
    switch (nutritionEntries.get(userId)) {
      case (null) { [] };
      case (?userEntries) {
        switch (userEntries.get(date)) {
          case (null) { [] };
          case (?dayEntries) { dayEntries.toArray().sort(NutritionEntry.compareByCreatedAt) };
        };
      };
    };
  };

  // Daily Goals
  public shared func updateDailyGoals(userId : Text, date : Text, goals : DailyGoals) : async () {
    let userGoals = switch (dailyGoals.get(userId)) {
      case (null) { Map.empty<Text, DailyGoals>() };
      case (?map) { map };
    };
    userGoals.add(date, goals);
    dailyGoals.add(userId, userGoals);
  };

  public query func getDailyGoals(userId : Text, date : Text) : async DailyGoals {
    switch (dailyGoals.get(userId)) {
      case (null) { { sleepDone = false; nmbDone = false; schoolDone = false } };
      case (?userGoals) {
        switch (userGoals.get(date)) {
          case (null) { { sleepDone = false; nmbDone = false; schoolDone = false } };
          case (?goals) { goals };
        };
      };
    };
  };

  // Streaks
  public shared func updateStreak(userId : Text, newStreak : Nat) : async () {
    streaks.add(userId, newStreak);
  };

  public query func getStreak(userId : Text) : async Nat {
    switch (streaks.get(userId)) {
      case (null) { 0 };
      case (?streak) { streak };
    };
  };

  // Measurements
  public shared func updateMeasurements(userId : Text, weeklyDate : Text, monthlyDate : Text) : async () {
    let record : MeasurementRecord = {
      weeklyMeasurementDate = weeklyDate;
      monthlyMeasurementDate = monthlyDate;
    };
    measurements.add(userId, record);
  };

  public query func getMeasurements(userId : Text) : async MeasurementRecord {
    switch (measurements.get(userId)) {
      case (null) { { weeklyMeasurementDate = ""; monthlyMeasurementDate = "" } };
      case (?record) { record };
    };
  };
};
