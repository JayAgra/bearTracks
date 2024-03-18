//
//  MatchList.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

/// List of all upcoming matches for the configured team number
struct MatchList: View {
    @EnvironmentObject var appState: AppState
    @State private var loadFailed: Bool = false
    @State private var loadComplete: Bool = false
    @State private var myTeamOnly = false
    
    var body: some View {
            NavigationView {
                if !appState.matchJson.isEmpty {
                    List {
                        ForEach(appState.matchJson) { match in
                            if !myTeamOnly || checkMatch(match: match) {
                                NavigationLink(destination: {
                                    MatchDetailView(match: match.matchNumber)
                                        .navigationTitle("match \(match.matchNumber)")
                                        .environmentObject(appState)
                                }, label: {
                                    VStack {
                                        Text(String(match.description))
                                            .font(.title3)
                                        HStack {
                                            Spacer()
                                            TeamNumberStack(match: match, num: 0)
                                            Spacer()
                                            TeamNumberStack(match: match, num: 1)
                                            Spacer()
                                            TeamNumberStack(match: match, num: 2)
                                            Spacer()
                                        }
                                    }
                                })
#if os(iOS)
                                .listRowBackground(UIDevice.current.userInterfaceIdiom == .pad ? Color.primary.colorInvert() : nil)
#elseif targetEnvironment(macCatalyst)
                                .listRowBackground(Color.primary.colorInvert())
#endif
                            }
                        }
                    }
                    .navigationTitle("Matches")
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(action: {
                                self.myTeamOnly.toggle()
                            }, label: {
                                if myTeamOnly {
                                    Label("Show Mine", systemImage: "line.3.horizontal.decrease.circle.fill")
                                        .labelStyle(.iconOnly)
                                } else {
                                    Label("Show All", systemImage: "line.3.horizontal.decrease.circle")
                                        .labelStyle(.iconOnly)
                                }
                            })
                        }
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
            .onAppear {
                fetchMatchJson()
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
                        self.appState.matchJson = result.Schedule
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
    
    private func checkMatch(match: Match) -> Bool {
        let myteam = UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "teamNumber") ?? "766";
        var isOk = false;
        match.teams.forEach { team in
            if String(team.teamNumber) == myteam {
                isOk = true
            }
        }
        return isOk;
    }
}

#Preview {
    MatchList()
}

struct TeamNumberStack: View {
    @State public var match: Match
    @State public var num: Int
    
    var body: some View {
        VStack {
            Text("\(String(match.teams[num].teamNumber))")
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .largeTitle)
                .fontWeight(
                    String(match.teams[num].teamNumber)
                    == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                    ? .bold : .regular
                )
                .foregroundColor(Color.red)
            Text("\(String(match.teams[num + 3].teamNumber))")
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .largeTitle)
                .fontWeight(
                    String(match.teams[num + 3].teamNumber)
                    == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                    ? .bold : .regular
                )
                .foregroundColor(Color.blue)
        }
    }
}
