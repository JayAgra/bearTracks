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
    @State private var detailMaximums: (Int, Int, Int, Int, Int, Int) = (1, 1, 1, 1, 1, 1)
    @State private var loadStarted: Bool = false
    
    var body: some View {
        VStack {
            if appState.matchJson.count != 0 {
                if teams.count == 6 {
                    ScrollView {
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
                                            ProgressView(value: Double(team.points.mean) / Double(detailMaximums.5))
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
                                            ProgressView(value: Double(team.points.mean) / Double(detailMaximums.5))
                                                .padding([.leading, .trailing])
                                                .tint(Color.blue)
                                        }
                                    }
                                    .padding()
                                }
                            }
                        }
                        Divider()
                        NumericalCompareView(teams: teams, title: "Speaker")
                        NumericalCompareView(teams: teams, title: "Amplifier")
                        NumericalCompareView(teams: teams, title: "Intake")
                        NumericalCompareView(teams: teams, title: "Travel")
                        NumericalCompareView(teams: teams, title: "Outtake")
                        NumericalCompareView(teams: teams, title: "Performance Score")
                        Divider()
                        BarThingyView(teams: teams, barMax: detailMaximums.0, title: "Speaker")
                        BarThingyView(teams: teams, barMax: detailMaximums.1, title: "Amplifier")
                        BarThingyView(teams: teams, barMax: detailMaximums.2, title: "Intake")
                        BarThingyView(teams: teams, barMax: detailMaximums.3, title: "Travel")
                        BarThingyView(teams: teams, barMax: detailMaximums.4, title: "Outtake")
                        BarThingyView(teams: teams, barMax: detailMaximums.5, title: "Performance Score")
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
                Text("the match list for the selected competition was not loaded properly")
                    .padding()
            }
        }
        .refreshable {
            self.teams = []
            self.loadData()
        }
        .onAppear {
            if !loadStarted {
                loadStarted = true
                self.loadData()
            }
        }
    }
    
    func fetchTeamStats(team: Int, completionBlock: @escaping (TeamStats?) -> Void) {
        guard
            let url = URL(string: "https://beartracks.io/api/v1/game/team_data/2024/\(UserDefaults(suiteName: "group.com.jayagra.beartracks")?.string(forKey: "eventCode") ?? "CAFR")/\(String(team))")
        else {
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
                    let result = try decoder.decode(TeamStats.self, from: data)
                    DispatchQueue.main.async {
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    completionBlock(nil)
                }
            } else if let error = error {
                print("fetch error: \(error)")
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
                                local = [teamSet.Red1!, teamSet.Red2!, teamSet.Red3!, teamSet.Blue1!, teamSet.Blue2!, teamSet.Blue3!]
                                local.forEach { result in
                                    if result.speaker.mean > self.detailMaximums.0 { self.detailMaximums.0 = result.speaker.mean }
                                    if result.amplifier.mean > self.detailMaximums.1 { self.detailMaximums.1 = result.amplifier.mean }
                                    if result.intake.mean > self.detailMaximums.2 { self.detailMaximums.2 = result.intake.mean }
                                    if result.travel.mean > self.detailMaximums.3 { self.detailMaximums.3 = result.travel.mean }
                                    if result.outtake.mean > self.detailMaximums.4 { self.detailMaximums.4 = result.outtake.mean }
                                    if result.points.mean > self.detailMaximums.5 { self.detailMaximums.5 = result.points.mean }
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
        let redScore: Int = teams[0].points.mean + teams[1].points.mean + teams[2].points.mean;
        let blueScore: Int = teams[3].points.mean + teams[4].points.mean + teams[5].points.mean;
        var pcnt: Double = Double(max(redScore, blueScore)) / Double(min(max(redScore, 1), max(blueScore, 1)));
        pcnt = (pcnt - 1) * 50;
        if pcnt > 100 {
            pcnt = 100
        }
        return (Int(pcnt.rounded()), redScore > blueScore)
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
