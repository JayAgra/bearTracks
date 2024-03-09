//
//  MatchDetailView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 3/8/24.
//

import SwiftUI

struct MatchDetailView: View {
    @State public var match: Int;
    @EnvironmentObject var appState: AppState;
    @State private var teams: [TeamStats] = [];
    @State private var maximum: Int = 0;
    
    var body: some View {
        VStack {
            VStack {
                if appState.matchJson.count != 0 {
                    if teams.count == 6 {
                        VStack {
                            VStack {
                                Text("75%")
                                HStack {
                                    List {
                                        ForEach(Array(teams.prefix(3)), id: \.team) { team in
                                            NavigationLink(destination: TeamView(team: String(team.team))) {
                                                VStack {
                                                    HStack {
                                                        Text(String(team.team))
                                                            .font(.title2)
                                                            .frame(maxWidth: .infinity, alignment: .leading)
                                                    }
                                                    HStack {
                                                        ProgressView(value: Double(team.points.mean), total: Double(maximum))
                                                            .padding([.leading, .trailing])
                                                            .tint(Color.red)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    List {
                                        ForEach(Array(teams.suffix(3)), id: \.team) { team in
                                            NavigationLink(destination: TeamView(team: String(team.team))) {
                                                VStack {
                                                    HStack {
                                                        Text(String(team.team))
                                                            .font(.title2)
                                                            .frame(maxWidth: .infinity, alignment: .leading)
                                                    }
                                                    HStack {
                                                        ProgressView(value: Double(team.points.mean), total: Double(maximum))
                                                            .padding([.leading, .trailing])
                                                            .tint(Color.blue)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        Spacer()
                        ProgressView()
                          .controlSize(.large)
                          .padding()
                        Spacer()
                        .onAppear {
                            self.loadData()
                        }
                    }
                } else {
                    Text("the match list for the selected competition was not loaded properly")
                        .padding()
                }
            }
            .navigationTitle("match \(String(match))")
        }
    }
    
    private func loadData() {
        appState.matchJson[match - 1].teams.forEach { team in
            guard
              let url = URL(
                string:
                    "https://beartracks.io/api/v1/game/team_data/2024/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/\(team.teamNumber)"
              )
            else { return }
            sharedSession.dataTask(with: url) { data, _, error in
              if let data = data {
                do {
                  let decoder = JSONDecoder()
                  let result = try decoder.decode(TeamStats.self, from: data)
                  DispatchQueue.main.async {
                    if result.points.mean < self.maximum {
                        self.maximum = result.points.mean
                    }
                    self.teams.append(result)
                  }
                } catch {
                  print("parse error \(error)")
                }
              } else if let error = error {
                print("fetch error: \(error)")
              }
            }
            .resume()
        }
    }
}

#Preview {
    MatchDetailView(match: 0)
}
