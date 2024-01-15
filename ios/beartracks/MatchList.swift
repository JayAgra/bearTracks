//
//  MatchList.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct MatchList: View {
    @State private var didInitialLoad: Bool = false
    @State private var matchJson: [Match] = []
    @State private var showSheet: Bool = false
    @ObservedObject var selectedItemTracker: MatchListModel = MatchListModel()
    
    var body: some View {
        VStack {
            Text("Matches")
                .font(.largeTitle)
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            ScrollView {
                LazyVStack {
                    if !matchJson.isEmpty {
                        ForEach(matchJson, id: \.description) { match in
                            VStack {
                                Text("\(match.description)")
                                    .font(.title3)
                                HStack {
                                    Text("\(String(match.teams[0].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[0].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.red)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[0].teamNumber))
                                            showSheet = true
                                        }
                                    Text("\(String(match.teams[1].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[1].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.red)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[1].teamNumber))
                                            showSheet = true
                                        }
                                    Text("\(String(match.teams[2].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[2].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.red)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[2].teamNumber))
                                            showSheet = true
                                        }
                                }
                                HStack {
                                    Text("\(String(match.teams[3].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[3].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.blue)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[3].teamNumber))
                                            showSheet = true
                                        }
                                    Text("\(String(match.teams[4].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[4].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.blue)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[4].teamNumber))
                                            showSheet = true
                                        }
                                    Text("\(String(match.teams[5].teamNumber))")
                                        .font(.largeTitle)
                                        .fontWeight(String(match.teams[5].teamNumber) == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766") ? .bold: .regular)
                                        .foregroundColor(Color.blue)
                                        .onTapGesture {
                                            selectedItemTracker.setSelectedItem(item: String(match.teams[5].teamNumber))
                                            showSheet = true
                                        }
                                }
                            }
                            .padding(.bottom)
                        }
                    } else {
                        Text("loading matches...")
                            .padding(.bottom)
                    }
                }
            }
//            .refreshable {
//                fetchMatchJson()
//            }
        }
        .padding()
        .onAppear() {
            if !didInitialLoad {
                fetchMatchJson()
                didInitialLoad = true
            }
        }
        .sheet(isPresented: $showSheet, onDismiss: {
            showSheet = false
        }, content: {
            TeamView(team: selectedItemTracker.getSelectedItem())
        })
    }
    
    func fetchMatchJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/events/matches/\(UserDefaults.standard.string(forKey: "season") ?? "2024")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR")/qualification/\( UserDefaults.standard.string(forKey: "teamNumber") ?? "766")") else {
            return
        }
        
        sharedSession.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(MatchData.self, from: data)
                    DispatchQueue.main.async {
                        self.matchJson = result.Schedule
                    }
                } catch {
                    print("parse error")
                }
            } else if let error = error {
                print("fetch error: \(error)")
            }
        }
        .resume()
    }
}

struct MatchData: Codable {
    let Schedule: [Match]
}

struct Match: Codable {
    let description: String
    let startTime: String
    let matchNumber: Int
    let field: String
    let tournamentLevel: String
    let teams: [Team]
}

struct Team: Codable {
    let teamNumber: Int
    let station: String
    let surrogate: Bool
}

#Preview {
    MatchList()
}
