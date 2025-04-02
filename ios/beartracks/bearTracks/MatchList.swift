//
//  MatchList.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct MatchList: View {
    @EnvironmentObject var appState: AppState
    @State private var myTeamOnly = false
    @State var selectedMatch: Int? = nil
    
    var body: some View {
        NavigationView {
            if !appState.matchJson.isEmpty {
                List {
                    ForEach(Array(appState.matchJson.enumerated()), id: \.element.id) { index, match in
                        if !myTeamOnly || match.teams.contains(where: { $0.teamNumber == Int(UserDefaults().string(forKey: "teamNumber") ?? "766") ?? 766 }) {
                            NavigationLink(tag: index, selection: self.$selectedMatch, destination: {
                                MatchDetailView(match: match.matchNumber)
                                    .navigationTitle("Match \(match.matchNumber)")
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
#if targetEnvironment(macCatalyst)
                                .padding(.vertical)
#endif
                            })
#if os(iOS)
                            .listRowBackground(UIDevice.current.userInterfaceIdiom == .pad ? Color.primary.colorInvert() : nil)
#elseif targetEnvironment(macCatalyst)
                            .listRowBackground(Color.primary.colorInvert())
#endif
                        }
                    }
                }
                .refreshable { appState.fetchMatchJson() }
                .onAppear { appState.fetchMatchJson() }
                .navigationTitle("Matches")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button(action: {
                            self.myTeamOnly.toggle()
                        }, label: {
                            if !appState.matchJson.isEmpty {
                                if myTeamOnly {
                                    Label("Show Mine", systemImage: "line.3.horizontal.decrease.circle.fill")
                                        .labelStyle(.iconOnly)
                                } else {
                                    Label("Show All", systemImage: "line.3.horizontal.decrease.circle")
                                        .labelStyle(.iconOnly)
                                }
                            } else {
                                Label("Loading...", systemImage: "hourglass")
                                    .labelStyle(.iconOnly)
                            }
                        })
                    }
                }
            } else {
                if appState.matchJsonStatus.1 {
                    VStack {
                        Label("Failed", systemImage: "xmark.seal.fill")
                            .padding(.bottom)
                            .labelStyle(.iconOnly)
                            .foregroundStyle(Color.pink)
                        Text("The match list for the selected competition was not loaded properly, most likely due to a client failure. Please try again. If the problem persists, contact the developers or your team lead.")
                            .padding()
                        Button(action: {
                            URLCache.shared.removeAllCachedResponses()
                            appState.fetchMatchJson()
                        }, label: {
                            Label("Retry", systemImage: "arrow.clockwise")
                        })
                        .padding()
                    }
                    .navigationTitle("Matches")
                } else {
                    if appState.matchJsonStatus.0 {
                        VStack {
                            Text("The match list returned was empty. This is not an error. If matches are already available online, please **clear network cache in settings**.")
                                .padding()
                            Button(action: {
                                URLCache.shared.removeAllCachedResponses()
                                appState.fetchMatchJson()
                            }, label: {
                                Label("Retry", systemImage: "arrow.clockwise")
                            })
                            .padding()
                        }
                        .navigationTitle("Matches")
                    } else {
                        VStack {
                            ProgressView()
                            Text("Loading...")
                                .padding(.bottom)
                        }
                        .onAppear { appState.fetchMatchJson() }
                    }
                }
            }
        }
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
#if os(visionOS)
                .font(.title2)
#else
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title3 : .title)
#endif
                .fontWeight(
                    String(match.teams[num].teamNumber)
                    == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                    ? .bold : .regular
                )
                .foregroundColor(Color.red)
            Text("\(String(match.teams[num + 3].teamNumber))")
#if os(visionOS)
                .font(.title2)
#else
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title3 : .title)
#endif
                .fontWeight(
                    String(match.teams[num + 3].teamNumber)
                    == (UserDefaults.standard.string(forKey: "teamNumber") ?? "766")
                    ? .bold : .regular
                )
                .foregroundColor(Color.blue)
        }
    }
}
