//
//  Teams.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import Foundation
import SwiftUI

/// Shows listing of top teams by scouting data performance, not RPs
struct Teams: View {
  @State private var teamsList: [TeamData] = []
  @State private var loadState: (Bool, Bool, Bool) = (false, false, false)
  @State private var selectedItem: String = ""

  var body: some View {
    VStack {
      NavigationStack {
        if !teamsList.isEmpty && !teamsList[0].isEmpty {
          List {
            ForEach(Array(teamsList[0].enumerated()), id: \.element.team.team) { index, team in
              NavigationLink(value: String(team.team.team)) {
                VStack {
                  HStack {
                    Text("\(String(index + 1))")
                      #if !os(watchOS)
                        .font(.title)
                      #else
                        .font(.title3)
                      #endif
                      .padding(.leading)
                      .frame(maxWidth: .infinity, alignment: .leading)
                    Text("\(String(team.team.team))")
                      #if !os(watchOS)
                        .font(.title)
                      #else
                        .font(.title3)
                      #endif
                      .padding(.trailing)
                      .frame(maxWidth: .infinity, alignment: .trailing)
                  }
                  .contentShape(Rectangle())
                  HStack {
                    ProgressView(
                      value: max(team.firstValue() ?? 0, 0)
                        / max(teamsList[0][0].firstValue() ?? 0, 1)
                    )
                    .padding([.leading, .trailing])
                  }
                  .contentShape(Rectangle())
                }
                .onTapGesture {
                  selectedItem = String(team.team.team)
                  loadState.0 = true
                }
                .contentShape(Rectangle())
                #if targetEnvironment(macCatalyst)
                  .padding([.top, .bottom])
                #endif
                #if os(visionOS)
                  .padding(.bottom)
                #endif
              }
              .contentShape(Rectangle())
            }
            #if os(watchOS)
              Section {
                VStack {
                  NavigationLink(destination: SettingsView()) {
                    HStack {
                      Text("Settings")
                      Spacer()
                      Label("", systemImage: "chevron.forward")
                        .labelStyle(.iconOnly)
                    }
                    .padding([.leading, .trailing])
                  }
                }
                .padding([.leading, .trailing])
              }
            #endif
          }
          .navigationTitle("Teams")
          .navigationDestination(isPresented: $loadState.0) {
            TeamView(team: selectedItem)
              .navigationTitle("team \(selectedItem)")
          }
        } else {
          if loadState.1 {
            VStack {
              Label("failed", systemImage: "xmark.seal.fill")
                .padding(.bottom)
                .labelStyle(.iconOnly)
                .foregroundStyle(Color.pink)
              Text("load failed")
                .padding(.bottom)
            }
            .navigationTitle("Teams")
          } else {
            if loadState.2 {
              VStack {
                Label("none", systemImage: "questionmark.app.dashed")
                  .padding(.bottom)
                  .labelStyle(.iconOnly)
                  .foregroundStyle(Color.pink)
                Text("no data")
                  .padding(.bottom)
              }
              .navigationTitle("Teams")
            } else {
              VStack {
                Label("loading", systemImage: "hourglass")
                  .padding(.bottom)
                  .labelStyle(.iconOnly)
                Text("loading teams...")
                  .padding(.bottom)
              }
              .navigationTitle("Teams")
            }
          }
        }
      }
    }
    .onAppear {
      fetchTeamsJson()
    }
  }

  func fetchTeamsJson() {
    guard
      let url = URL(
        string:
          "https://beartracks.io/api/v1/data/teams/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "season") ?? "2024")/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")"
      )
    else {
      return
    }

    sharedSession.dataTask(with: url) { data, _, error in
      if let data = data {
        do {
          let decoder = JSONDecoder()
          var result = try decoder.decode(TeamData.self, from: data)
          result.sort {
            if let mainWeightA = $0.firstValue(), let mainWeightB = $1.firstValue() {
              return mainWeightA > mainWeightB
            } else {
              return true
            }
          }
          DispatchQueue.main.async {
            self.loadState = (self.loadState.0, false, true)
            self.teamsList = [result]
          }
        } catch {
          print("parse error \(error)")
          self.loadState.1 = true
        }
      } else if let error = error {
        print("fetch error: \(error)")
        self.loadState.1 = true
      }
    }.resume()
  }
}

#Preview {
  Teams()
}

struct TeamElement: Codable {
  let team: TeamEl

  enum CodingKeys: String, CodingKey {
    case team = "Team"
  }

  func firstValue() -> Float? {
    return team.weight.components(separatedBy: ",").compactMap({ Float($0) }).first
  }
}

/// bearTracks API response structure
struct TeamEl: Codable {
  let id: Int
  let team: Int
  let weight: String

  enum CodingKeys: String, CodingKey {
    case id = "id"
    case team = "team"
    case weight = "weight"
  }
}

/// Alias of `TeamEl` to match the exact structure of API response
/// > Can remove this in future versions
typealias TeamData = [TeamElement]
