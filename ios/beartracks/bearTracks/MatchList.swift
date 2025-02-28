//
//  MatchList.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct MatchList: View {
    @EnvironmentObject var appState: AppState
    @State private var loadFailed: Bool = false
    @State private var loadComplete: Bool = false
    @State private var myTeamOnly = false
    @State var selectedMatch: Int? = nil
    
    var body: some View {
            NavigationView {
                VStack {
                    if !appState.matchJson.isEmpty {
                        List {
                            ForEach(0..<appState.matchJson.count, id: \.self) { index in
                                if !myTeamOnly || checkMatch(match: appState.matchJson[index]) {
                                    NavigationLink(tag: index, selection: self.$selectedMatch, destination: {
                                        MatchDetailView(match: appState.matchJson[index].matchNumber)
                                            .navigationTitle("Match \(appState.matchJson[index].matchNumber)")
                                            .environmentObject(appState)
                                    }, label: {
                                        VStack {
                                            Text(String(appState.matchJson[index].description))
                                                .font(.title3)
                                            HStack {
                                                Spacer()
                                                TeamNumberStack(match: appState.matchJson[index], num: 0)
                                                Spacer()
                                                TeamNumberStack(match: appState.matchJson[index], num: 1)
                                                Spacer()
                                                TeamNumberStack(match: appState.matchJson[index], num: 2)
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
                        if appState.matchJsonStatus.1 {
                            VStack {
                                Label("Failed", systemImage: "xmark.seal.fill")
                                    .padding(.bottom)
                                    .labelStyle(.iconOnly)
                                    .foregroundStyle(Color.pink)
                                Text("The match list for the selected competition was not loaded properly, most likely due to a client failure. Please try again. If the problem persists, contact the developers or your team lead.")
                                    .padding()
                            }
                        } else {
                            if appState.matchJsonStatus.0 {
                                VStack {
                                    Label("none", systemImage: "questionmark.app.dashed")
                                        .padding(.bottom)
                                        .labelStyle(.iconOnly)
                                        .foregroundStyle(Color.pink)
                                    Text("The match list returned was empty. This is not an error. If matches are already available online, please **clear network cache in settings**.")
                                        .padding()
                                }
                            } else {
                                VStack {
                                    Label("Loading", systemImage: "hourglass")
                                        .padding(.bottom)
                                        .labelStyle(.iconOnly)
                                    Text("Loading...")
                                        .padding(.bottom)
                                }
                            }
                        }
                    }
                }
                .refreshable { appState.fetchMatchJson() }
                .onAppear { appState.fetchMatchJson() }
                .navigationTitle("Matches")
            }
    }
    
    private func checkMatch(match: Match) -> Bool {
        let myteam = UserDefaults().string(forKey: "teamNumber") ?? "766";
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
#if os(visionOS)
                .font(.title2)
#else
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .largeTitle)
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
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .largeTitle)
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
