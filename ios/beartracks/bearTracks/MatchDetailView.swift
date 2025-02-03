//
//  MatchDetailView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 3/8/24.
//

import SwiftUI

struct MatchDetailView: View {
    @State public var match: Int
    @EnvironmentObject var appState: AppState
    @State private var teams: [TeamStats] = []
    @State private var detailMaximums: (Int, Int, Int, Int, Int, Int, Int, Int, Int) = (1, 1, 1, 1, 1, 1, 1, 1, 1)
    @State private var loadStarted: Bool = false
    @State private var eventCodeInput: String = UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? ""
    @State private var settingsOptions: [DataMetadata] = []
    // dont even talk to me about this one
    let emptyTeamStat = TeamStats(team: 0, leave: 0.0, park: 0.0, shallow_cage: 0.0, deep_cage: 0.0, intake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), travel_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), outtake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), algae: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_0: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_1: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_2: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_3: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), score: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), auto_scores: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0))

    
    var body: some View {
#if !os(tvOS)
        VStack {
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                if teams.count == 6 {
                    ScrollView {
                        Text("Match \(String(match))")
                            .font(.largeTitle)
                        Text("+\(calculateWinner().0)%")
                            .font(.title)
                            .foregroundStyle(calculateWinner().1 ? Color.red : Color.blue)
                        HStack {
                            VStack {
                                ForEach(Array(teams.prefix(3)), id: \.team) { team in
                                    VStack {
                                        NavigationLink(destination: {
                                            TeamView(dataItems: TeamViewModel(team: String(team.team)))
                                                .environmentObject(appState)
                                        }, label: {
                                            HStack {
                                                Text(String(team.team))
                                                    .font(.title2)
                                                    .foregroundStyle(Color.primary)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                        })
                                        HStack {
                                            ProgressView(value: Double(team.score.mean) / Double(detailMaximums.5))
                                                .padding([.leading, .trailing])
                                                .tint(Color.red)
                                        }
                                    }
                                    .padding()
                                }
                            }
                            VStack {
                                ForEach(Array(teams.suffix(3)), id: \.team) { team in
                                    VStack {
                                        NavigationLink(destination: {
                                            TeamView(dataItems: TeamViewModel(team: String(team.team)))
                                                .environmentObject(appState)
                                        }, label: {
                                            HStack {
                                                Text(String(team.team))
                                                    .font(.title2)
                                                    .foregroundStyle(Color.primary)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                        })
                                        HStack {
                                            ProgressView(value: Double(team.score.mean) / Double(detailMaximums.8))
                                                .padding([.leading, .trailing])
                                                .tint(Color.blue)
                                        }
                                    }
                                    .padding()
                                }
                            }
                        }
                        Divider()
                        NumericalCompareView(teams: teams, title: "Algae")
                        NumericalCompareView(teams: teams, title: "Level 1")
                        NumericalCompareView(teams: teams, title: "Level 2")
                        NumericalCompareView(teams: teams, title: "Level 3")
                        NumericalCompareView(teams: teams, title: "Level 4")
                        NumericalCompareView(teams: teams, title: "Intake")
                        NumericalCompareView(teams: teams, title: "Travel")
                        NumericalCompareView(teams: teams, title: "Outtake")
                        NumericalCompareView(teams: teams, title: "Performance Score")
                        Divider()
                        BarThingyView(teams: teams, barMax: detailMaximums.0, title: "Algae")
                        BarThingyView(teams: teams, barMax: detailMaximums.1, title: "Level 1")
                        BarThingyView(teams: teams, barMax: detailMaximums.2, title: "Level 2")
                        BarThingyView(teams: teams, barMax: detailMaximums.3, title: "Level 3")
                        BarThingyView(teams: teams, barMax: detailMaximums.4, title: "Level 4")
                        BarThingyView(teams: teams, barMax: detailMaximums.5, title: "Intake")
                        BarThingyView(teams: teams, barMax: detailMaximums.6, title: "Travel")
                        BarThingyView(teams: teams, barMax: detailMaximums.7, title: "Outtake")
                        BarThingyView(teams: teams, barMax: detailMaximums.8, title: "Performance Score")
                    }
                } else {
                    VStack {
                        Spacer()
                        ProgressView()
                            .controlSize(.large)
                            .padding()
                        Spacer()
                    }
                }
            } else {
                Text("The match list for the selected competition was not loaded properly, most likely due to a client failure. Please try again. If the problem persists, contact the developers or your team lead.")
                    .padding()
            }
        }
        .refreshable {
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                self.teams = []
                self.loadData()
            }
        }
        .onAppear {
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                if !loadStarted {
                    loadStarted = true
                    self.loadData()
                }
            }
        }
#else
        NavigationStack {
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                if teams.count == 6 {
                    ScrollView {
                        Text("Match \(String(match))")
                            .font(.largeTitle)
                        Text("+\(calculateWinner().0)%")
                            .font(.title)
                            .foregroundStyle(calculateWinner().1 ? Color.red : Color.blue)
                        HStack {
                            VStack {
                                ForEach(Array(teams.prefix(3)), id: \.team) { team in
                                        VStack {
                                            HStack {
                                                Text(String(team.team))
                                                    .font(.title2)
                                                    .foregroundStyle(Color.primary)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                            HStack {
                                                ProgressView(value: Double(team.score.mean) / Double(detailMaximums.8))
                                                    .padding([.leading, .trailing])
                                                    .tint(Color.red)
                                            }
                                        }
                                        .padding()
                                }
                            }
                            VStack {
                                ForEach(Array(teams.suffix(3)), id: \.team) { team in
                                        VStack {
                                            HStack {
                                                Text(String(team.team))
                                                    .font(.title2)
                                                    .foregroundStyle(Color.primary)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                            HStack {
                                                ProgressView(value: Double(team.score.mean) / Double(detailMaximums.8))
                                                    .padding([.leading, .trailing])
                                                    .tint(Color.blue)
                                            }
                                        }
                                        .padding()
                                }
                            }
                        }
                    }
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            EventSelectButton
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(action: {
                                match -= 1
                                self.loadData()
                            }, label: {
                                Label("", systemImage: "chevron.left")
                            })
                            .disabled(match == 1)
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(action: {
                                self.loadData()
                            }, label: {
                                Label("", systemImage: "arrow.clockwise")
                            })
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button(action: {
                                match += 1
                                self.loadData()
                            }, label: {
                                Label("", systemImage: "chevron.right")
                            })
                            .disabled(match ==  appState.matchJson.count)
                        }
                    }
                    .onAppear {
                        loadSettingsJson { result in
                            self.settingsOptions = result
                        }
                    }
                } else {
                    VStack {
                        Spacer()
                        ProgressView()
                            .padding()
                        Spacer()
                    }
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            EventSelectButton
                        }
                    }
                }
            } else {
                VStack {
                    Text("The match list for the selected competition was not loaded properly, most likely due to a client failure. Please try again. If the problem persists, contact the developers or your team lead.")
                        .padding()
                }
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        EventSelectButton
                    }
                }
            }
        }
        .refreshable {
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                self.teams = []
                self.loadData()
            }
        }
        .onAppear {
            loadSettingsJson { result in
                self.settingsOptions = result
            }
            if appState.matchJson.count != 0 && appState.matchJson.count >= match {
                if !loadStarted {
                    loadStarted = true
                    self.loadData()
                }
            }
        }
#endif
    }
    
    var EventSelectButton: some View {
        Button(action: {
            loadSettingsJson { result in
                self.settingsOptions = result
            }
            if !settingsOptions.isEmpty && !settingsOptions[0].events.isEmpty {
                let ci = (settingsOptions[0].events.firstIndex{$0 == UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR"} ?? 0)
                if ci == settingsOptions[0].events.count - 1 {
                    UserDefaults(suiteName: "group.com.jayagra.beartracks")?.set(settingsOptions[0].events[0], forKey: "eventCode")
                } else {
                    UserDefaults(suiteName: "group.com.jayagra.beartracks")?.set(settingsOptions[0].events[ci + 1], forKey: "eventCode")
                }
                match = 0
                appState.fetchMatchJson()
                self.loadData()
            }
        }, label: {
            Label(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR", systemImage: "flag.checkered")
                .labelStyle(.titleOnly)
        })
    }
    
    func fetchTeamStats(team: Int, completionBlock: @escaping (TeamStats?) -> Void) {
        guard
            let url = URL(string: "https://beartracks.io/api/v1/game/team_data/2025/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.bool(forKey: "useAllCompData") ?? false ? "ALL" : UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/\(String(team))")
        else {
            return
        }
        // useAllCompData
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(TeamStats.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock(result)
                    }
                } catch {
                    print("Parse error")
                    completionBlock(nil)
                }
            } else if let error = error {
                print("Fetch error: \(error)")
                completionBlock(nil)
            }
        }
        requestTask.resume()
    }
        
    private func loadData() {
        var teamSet = TeamSet()
        var local: [TeamStats] = []
        fetchTeamStats(team: appState.matchJson[match - 1].teams[0].teamNumber) { Red1Data in
            teamSet.Red1 = Red1Data
            fetchTeamStats(team: appState.matchJson[match - 1].teams[1].teamNumber) { Red2Data in
                teamSet.Red2 = Red2Data
                fetchTeamStats(team: appState.matchJson[match - 1].teams[2].teamNumber) { Red3Data in
                    teamSet.Red3 = Red3Data
                    fetchTeamStats(team: appState.matchJson[match - 1].teams[3].teamNumber) { Blue1Data in
                        teamSet.Blue1 = Blue1Data
                        fetchTeamStats(team: appState.matchJson[match - 1].teams[4].teamNumber) { Blue2Data in
                            teamSet.Blue2 = Blue2Data
                            fetchTeamStats(team: appState.matchJson[match - 1].teams[5].teamNumber) { Blue3Data in
                                teamSet.Blue3 = Blue3Data
                                local = [teamSet.Red1 ?? emptyTeamStat, teamSet.Red2 ?? emptyTeamStat, teamSet.Red3 ?? emptyTeamStat, teamSet.Blue1 ?? emptyTeamStat, teamSet.Blue2 ?? emptyTeamStat, teamSet.Blue3 ?? emptyTeamStat]
                                local.forEach { result in
                                    if result.algae.mean > self.detailMaximums.0 { self.detailMaximums.0 = result.algae.mean }
                                    if result.level_0.mean > self.detailMaximums.1 { self.detailMaximums.1 = result.level_0.mean }
                                    if result.level_1.mean > self.detailMaximums.2 { self.detailMaximums.2 = result.level_1.mean }
                                    if result.level_2.mean > self.detailMaximums.3 { self.detailMaximums.3 = result.level_2.mean }
                                    if result.level_3.mean > self.detailMaximums.4 { self.detailMaximums.4 = result.level_3.mean }
                                    if result.intake_time.mean > self.detailMaximums.5 { self.detailMaximums.5 = result.intake_time.mean }
                                    if result.travel_time.mean > self.detailMaximums.6 { self.detailMaximums.6 = result.travel_time.mean }
                                    if result.outtake_time.mean > self.detailMaximums.7 { self.detailMaximums.7 = result.outtake_time.mean }
                                    if result.score.mean > self.detailMaximums.8 { self.detailMaximums.8 = result.score.mean }
                                }
                                self.teams = local
                            }
                        }
                    }
                }
            }
        }
    }
    
    private func calculateWinner() -> (Int, Bool) {
        let redScore: Int = teams[0].score.mean + teams[1].score.mean + teams[2].score.mean;
        let blueScore: Int = teams[3].score.mean + teams[4].score.mean + teams[5].score.mean;
        var pcnt: Double = Double(max(redScore, blueScore)) / Double(min(max(redScore, 1), max(blueScore, 1)));
        pcnt = (pcnt - 1) * 50;
        if pcnt > 100 {
            pcnt = 100
        }
        return (Int(pcnt.rounded()), redScore > blueScore)
    }
    
    func loadSettingsJson(completionBlock: @escaping ([DataMetadata]) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/data") else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(DataMetadata.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock([result])
                    }
                } catch {
                    print("Parse error")
                    completionBlock([])
                }
            } else if let error = error {
                print("Fetch error: \(error)")
                completionBlock([])
            }
        }
        requestTask.resume()
    }
}

#Preview {
    MatchDetailView(match: 0)
}

struct NumericalCompareView: View {
    @State public var teams: [TeamStats]
    @State public var title: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.title3)
            HStack {
                Spacer()
                Text(String(teams[0][title].mean + teams[1][title].mean + teams[2][title].mean))
                    .font(.largeTitle)
                Spacer();Spacer();
                Text(String(teams[3][title].mean + teams[4][title].mean + teams[5][title].mean))
                    .font(.largeTitle)
                Spacer()
            }
        }
        .padding()
    }
}

struct BarThingyView: View {
    @State public var teams: [TeamStats]
    @State public var barMax: Int
    @State public var title: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.title3)
            HStack {
                VStack {
                    ForEach(Array(teams.prefix(3)), id: \.team) { team in
                        ProgressView(value: Double(team[title].mean) / Double(barMax))
                            .tint(Color.red)
                    }
                }
                VStack {
                    ForEach(Array(teams.suffix(3)), id: \.team) { team in
                        ProgressView(value: Double(team[title].mean) / Double(barMax))
                            .tint(Color.blue)
                    }
                }
            }
            .padding()
        }
        .padding()
    }
}

struct TeamSet {
    var Red1, Red2, Red3: TeamStats?
    var Blue1, Blue2, Blue3: TeamStats?
}

#if os(tvOS)
struct DataMetadata: Codable {
    let seasons: [String]
    let events: [String]
    let teams: [String]
}
#endif
