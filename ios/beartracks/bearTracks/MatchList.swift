//
//  MatchList.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

/// List of all upcoming matches for the configured team number
struct MatchList: View {
  @State private var didInitialLoad: Bool = false
  @State private var matchJson: [Match] = []
  @State private var showSheet: Bool = false
  @State private var loadFailed: Bool = false
  @State private var loadComplete: Bool = false
  @State private var selectedItem: String = ""

  var body: some View {
    VStack {
      NavigationStack {
        if !matchJson.isEmpty {
          List {
            ForEach(matchJson, id: \.description) { match in
              VStack {
                Text("\(match.description)")
                  .font(.title3)
                HStack {
                  Spacer()
                  VStack {
                    Text("\(String(match.teams[0].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[0].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.red)
                      .onTapGesture {
                        selectedItem = String(match.teams[0].teamNumber)
                        showSheet = true
                      }

                    Text("\(String(match.teams[3].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[3].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.blue)
                      .onTapGesture {
                        selectedItem = String(match.teams[3].teamNumber)
                        showSheet = true
                      }
                  }
                  Spacer()
                  VStack {
                    Text("\(String(match.teams[1].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[1].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.red)
                      .onTapGesture {
                        selectedItem = String(match.teams[1].teamNumber)
                        showSheet = true
                      }
                    Text("\(String(match.teams[4].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[4].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.blue)
                      .onTapGesture {
                        selectedItem = String(match.teams[4].teamNumber)
                        showSheet = true
                      }
                  }
                  Spacer()
                  VStack {
                    Text("\(String(match.teams[2].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[2].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.red)
                      .onTapGesture {
                        selectedItem = String(match.teams[2].teamNumber)
                        showSheet = true
                      }
                    Text("\(String(match.teams[5].teamNumber))")
                      .font(.largeTitle)
                      .fontWeight(
                        String(match.teams[5].teamNumber)
                          == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                          ? .bold : .regular
                      )
                      .foregroundColor(Color.blue)
                      .onTapGesture {
                        selectedItem = String(match.teams[5].teamNumber)
                        showSheet = true
                      }
                  }
                  Spacer()
                }
              }
            }
          }
          .navigationTitle("Matches")
          .navigationDestination(isPresented: $showSheet) {
            TeamView(team: selectedItem)
              .navigationTitle("team \(selectedItem)")
          }
        } else {
          if loadFailed {
            VStack {
              Label("failed", systemImage: "xmark.seal.fill")
                .padding(.bottom)
                .labelStyle(.iconOnly)
                .foregroundStyle(Color.pink)
              Text("load failed")
                .padding(.bottom)
            }
            .navigationTitle("Matches")
          } else {
            if loadComplete {
              VStack {
                Label("none", systemImage: "questionmark.app.dashed")
                  .padding(.bottom)
                  .labelStyle(.iconOnly)
                  .foregroundStyle(Color.pink)
                Text("matches not yet posted")
                  .padding(.bottom)
              }
              .navigationTitle("Matches")
            } else {
              VStack {
                Label("loading", systemImage: "hourglass")
                  .padding(.bottom)
                  .labelStyle(.iconOnly)
                Text("loading matches...")
                  .padding(.bottom)
              }
              .navigationTitle("Matches")
            }
          }
        }
      }
    }
    .onAppear {
      if !didInitialLoad {
        fetchMatchJson()
        didInitialLoad = true
      }
    }
  }

  func fetchMatchJson() {
    guard
      let url = URL(
        string:
          "https://beartracks.io/api/v1/events/matches/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "season") ?? "2024")/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/qualification/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "teamNumber") ?? "766")"
      )
    else {
      return
    }

    sharedSession.dataTask(with: url) { data, _, error in
      if let data = data {
        do {
          let decoder = JSONDecoder()
          let result = try decoder.decode(MatchData.self, from: data)
          DispatchQueue.main.async {
            self.loadComplete = true
            self.loadFailed = false
            self.matchJson = result.Schedule
          }
        } catch {
          print("parse error")
          self.loadFailed = true
        }
      } else if let error = error {
        print("fetch error: \(error)")
        self.loadFailed = true
      }
    }
    .resume()
  }
}

/// FRC API's Schedule structure
struct MatchData: Codable {
  let Schedule: [Match]
}

/// FRC API's Match structure
struct Match: Codable {
  let description: String
  let startTime: String
  let matchNumber: Int
  let field: String
  let tournamentLevel: String
  let teams: [Team]
}

/// FRC API's Team structure
struct Team: Codable {
  let teamNumber: Int
  let station: String
  let surrogate: Bool
}

#Preview {
  MatchList()
}
