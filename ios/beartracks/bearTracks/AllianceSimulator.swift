//
//  AllianceSimulator.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 3/10/25.
//

import SwiftUI

enum SimulationType {
    case alliance, match
}

struct AllianceSimulator: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @State private var simType: SimulationType = .alliance
    @State private var alliance: (Int?, Int?, Int?) = (nil, nil, nil)
    @State private var opposition: (Int?, Int?, Int?) = (nil, nil, nil)
    @State private var allTeams: AllTeamsList = AllTeamsList(status: 0, teams: [])
    @State private var teams: [TeamStats] = []
    @State private var detailMaximums: (Int, Int, Int, Int, Int, Int, Int, Int, Int) = (1, 1, 1, 1, 1, 1, 1, 1, 1)
    @State private var eventCodeInput: String = UserDefaults().string(forKey: "eventCode") ?? ""
    
    var body: some View {
        NavigationView {
            VStack {
                if allTeams.status == 0 {
                    Spacer()
                    ProgressView()
                        .onAppear() {
                            getAllTeams()
                        }
                    Spacer()
                } else if allTeams.status == 2 {
                    Spacer()
                    Label("Failure", systemImage: "xmark.seal.fill")
                        .padding(.bottom)
                        .labelStyle(.iconOnly)
                        .foregroundStyle(Color.pink)
                    Text("Encountered a fatal error when attempting to load team list.")
                        .padding(.bottom)
                    Button(action: {
                        dismiss()
                    }, label: {
                        Label("Back", systemImage: "xmark")
                            .labelStyle(.titleOnly)
                    })
                    .buttonStyle(.bordered)
                    .padding()
                    Spacer()
                } else {
                    Picker("type", selection: $simType) {
                        Text("Alliance")
                            .tag(SimulationType.alliance)
                        Text("Match")
                            .tag(SimulationType.match)
                    }
                    .pickerStyle(.segmented)
                    .padding()
                    if simType == SimulationType.alliance {
                        HStack {
                            Spacer()
                            Picker("Team 1", selection: $alliance.0) {
                                Text("00000")
                                    .tag(nil as Int?)
                                ForEach(allTeams.teams, id: \.number) { team in
                                    Text(String(team.number))
                                        .tag(team.number)
                                }
                            }
                            Spacer()
                            Picker("Team 2", selection: $alliance.1) {
                                Text("00000")
                                    .tag(nil as Int?)
                                ForEach(allTeams.teams, id: \.number) { team in
                                    Text(String(team.number))
                                        .tag(team.number)
                                }
                            }
                            Spacer()
                            Picker("Team 3", selection: $alliance.2) {
                                Text("00000")
                                    .tag(nil as Int?)
                                ForEach(allTeams.teams, id: \.number) { team in
                                    Text(String(team.number))
                                        .tag(team.number)
                                }
                            }
                            Spacer()
                        }.padding()
                        Divider()
                        ScrollView {
                            VStack {
                                if alliance.0 != nil && alliance.1 != nil && alliance.2 != nil {
                                    if alliance.0 != alliance.1 && alliance.1 != alliance.2 && alliance.2 != alliance.0 {
                                        AllianceChonk(alliance: $alliance)
                                    } else {
                                        Text("Please select 3 **unique** teams").padding()
                                    }
                                } else {
                                    Text("Please select 3 teams").padding()
                                }
                            }
                        }
                    } else {
                        VStack {
                            HStack {
                                Spacer()
                                Picker("Team 1", selection: $alliance.0) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.red)
                                Spacer()
                                Picker("Team 2", selection: $alliance.1) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.red)
                                Spacer()
                                Picker("Team 3", selection: $alliance.2) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.red)
                                Spacer()
                            }.padding(.top)
                            HStack {
                                Spacer()
                                Picker("Team 1", selection: $opposition.0) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.blue)
                                Spacer()
                                Picker("Team 2", selection: $opposition.1) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.blue)
                                Spacer()
                                Picker("Team 3", selection: $opposition.2) {
                                    Text("00000")
                                        .tag(nil as Int?)
                                    ForEach(allTeams.teams, id: \.number) { team in
                                        Text(String(team.number))
                                            .tag(team.number)
                                    }
                                }.tint(Color.blue)
                                Spacer()
                            }.padding(.bottom)
                        }
                        Divider()
                        ScrollView {
                            VStack {
                                if alliance.0 != nil && alliance.1 != nil && alliance.2 != nil {
                                    if alliance.0 != alliance.1 && alliance.1 != alliance.2 && alliance.2 != alliance.0 {
                                        if opposition.0 != nil && opposition.1 != nil && opposition.2 != nil {
                                            if opposition.0 != opposition.1 && opposition.1 != opposition.2 && opposition.2 != opposition.0 {
                                                MatchViewChonk(alliance: $alliance, opposition: $opposition)
                                                    .environmentObject(appState)
                                            } else {
                                                Text("Please select 3 **unique** opposition teams").padding()
                                            }
                                        } else {
                                            Text("Please select 3 opposition teams").padding()
                                        }
                                    } else {
                                        Text("Please select 3 **unique** alliance teams").padding()
                                    }
                                } else {
                                    Text("Please select 3 alliance teams").padding()
                                }
                            }
                        }
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close", systemImage: "xmark") {
                        dismiss()
                    }
                }
            }
            .navigationTitle("Alliance Simulator")
        }
    }
    
    func getAllTeams() {
        self.allTeams = AllTeamsList(status: 0, teams: [])
        guard let url = URL(string:"https://beartracks.io/api/v1/events/teams/\(UserDefaults.standard.string(forKey: "season") ?? "2025")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST")")
        else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode(TeamList.self, from: data)
                    DispatchQueue.main.async {
                        self.allTeams = AllTeamsList(status: 1, teams: result.teams.map{ BasicTeam(number: $0.teamNumber, nameShort: $0.nameShort) })
                    }
                } catch {
                    print(error)
                    DispatchQueue.main.sync {
                        self.allTeams = AllTeamsList(status: 2, teams: [])
                    }
                }
            } else {
                DispatchQueue.main.sync {
                    self.allTeams = AllTeamsList(status: 2, teams: [])
                }
            }
        }
        requestTask.resume()
    }
}

struct MatchViewChonk: View {
    @EnvironmentObject var appState: AppState
    @Binding var alliance: (Int?, Int?, Int?)
    @Binding var opposition: (Int?, Int?, Int?)
    @State var teams: [TeamStats] = []
    @State var detailMaximums: (Int, Int, Int, Int, Int, Int, Int, Int, Int) = (1, 1, 1, 1, 1, 1, 1, 1, 1)
    @State var loadingData: Bool = true
    let emptyTeamStat = TeamStats(team: 0, leave: 0.0, park: 0.0, shallow_cage: 0.0, deep_cage: 0.0, intake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), travel_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), outtake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), algae: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_0: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_1: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_2: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_3: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), score: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), auto_scores: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0))
    
    var body: some View {
        VStack {
            VStack {
                if loadingData == true {
                    ProgressView()
                } else {
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
            }
            .onChange(of: alliance.0) { _ in loadData() }
            .onChange(of: alliance.1) { _ in loadData() }
            .onChange(of: alliance.2) { _ in loadData() }
            .onChange(of: opposition.0) { _ in loadData() }
            .onChange(of: opposition.1) { _ in loadData() }
            .onChange(of: opposition.2) { _ in loadData() }
            .onAppear {
                loadData()
            }
        }
    }
    
    func calculateWinner() -> (Int, Bool) {
        let redScore: Int = teams[0].score.mean + teams[1].score.mean + teams[2].score.mean;
        let blueScore: Int = teams[3].score.mean + teams[4].score.mean + teams[5].score.mean;
        var pcnt: Double = Double(max(redScore, blueScore)) / Double(min(max(redScore, 1), max(blueScore, 1)));
        pcnt = (pcnt - 1) * 50;
        if pcnt > 100 {
            pcnt = 100
        }
        return (Int(pcnt.rounded()), redScore > blueScore)
    }
    
    func fetchTeamStats(team: Int, completionBlock: @escaping (TeamStats?) -> Void) {
        guard let url = URL(string: "https://beartracks.io/api/v1/game/team_data/2025/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")/\(String(team))") else { return }
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
    
    func loadData() {
        loadingData = true
        var teamSet = TeamSet()
        var local: [TeamStats] = []
        fetchTeamStats(team: alliance.0 ?? 0) { Red1Data in
            teamSet.Red1 = Red1Data
            fetchTeamStats(team: alliance.1 ?? 0) { Red2Data in
                teamSet.Red2 = Red2Data
                fetchTeamStats(team: alliance.2 ?? 0) { Red3Data in
                    teamSet.Red3 = Red3Data
                    fetchTeamStats(team: opposition.0 ?? 0) { Blue1Data in
                        teamSet.Blue1 = Blue1Data
                        fetchTeamStats(team: opposition.1 ?? 0) { Blue2Data in
                            teamSet.Blue2 = Blue2Data
                            fetchTeamStats(team: opposition.2 ?? 0) { Blue3Data in
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
                                loadingData = false
                            }
                        }
                    }
                }
            }
        }
    }
}

struct AllianceChonk: View {
    @Binding var alliance: (Int?, Int?, Int?)
    @State private var teams: [TeamStats] = []
    @State private var detailMaximums: (Int, Int, Int, Int, Int, Int, Int, Int, Int) = (1, 1, 1, 1, 1, 1, 1, 1, 1)
    @State private var loadingData: Bool = true
    // dont even talk to me about this one
    public var emptyTeamStat = TeamStats(team: 0, leave: 0.0, park: 0.0, shallow_cage: 0.0, deep_cage: 0.0, intake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), travel_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), outtake_time: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), algae: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_0: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_1: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_2: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), level_3: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), score: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0), auto_scores: DataStats(first: 0, median: 0, third: 0, mean: 0, decaying: 0))
    
    var body: some View {
        VStack {
            if alliance.0 != nil && alliance.1 != nil && alliance.2 != nil {
                if alliance.0 != alliance.1 && alliance.1 != alliance.2 && alliance.2 != alliance.0 {
                    VStack {
                        if loadingData == true {
                            ProgressView()
                        } else {
                            NumericalCompareViewAlliance(teams: teams, title: "Algae").padding()
                            HStack {
                                Spacer()
                                NumericalCompareViewAlliance(teams: teams, title: "Level 1"); Spacer();
                                NumericalCompareViewAlliance(teams: teams, title: "Level 2"); Spacer();
                                NumericalCompareViewAlliance(teams: teams, title: "Level 3"); Spacer();
                                NumericalCompareViewAlliance(teams: teams, title: "Level 4"); Spacer();
                                Spacer()
                            }.padding(.vertical)
                            HStack {
                                Spacer()
                                NumericalCompareViewAlliance(teams: teams, title: "Intake"); Spacer();
                                NumericalCompareViewAlliance(teams: teams, title: "Travel"); Spacer();
                                NumericalCompareViewAlliance(teams: teams, title: "Outtake"); Spacer();
                                Spacer()
                            }.padding(.vertical)
                            NumericalCompareViewAlliance(teams: teams, title: "Performance Score").padding()
                            Divider()
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.0, title: "Algae")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.1, title: "Level 1")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.2, title: "Level 2")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.3, title: "Level 3")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.4, title: "Level 4")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.5, title: "Intake")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.6, title: "Travel")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.7, title: "Outtake")
                            BarThingyViewAlliance(teams: teams, barMax: detailMaximums.8, title: "Performance Score")
                        }
                    }
                    .onChange(of: alliance.0) { _ in loadData() }
                    .onChange(of: alliance.1) { _ in loadData() }
                    .onChange(of: alliance.2) { _ in loadData() }
                    .onAppear() {
                        loadData()
                    }
                } else {
                    Text("Please select 3 **unique** teams")
                }
            } else {
                Text("Please select 3 teams")
            }
        }
    }
    
    func fetchTeamStats(team: Int, completionBlock: @escaping (TeamStats?) -> Void) {
        guard
            let url = URL(string: "https://beartracks.io/api/v1/game/team_data/2025/\(UserDefaults().string(forKey: "eventCode") ?? "TEST")/\(String(team))")
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
        loadingData = true
        var teamSet = TeamSet()
        var local: [TeamStats] = []

        fetchTeamStats(team: alliance.0 ?? 0) { Blue1Data in
            teamSet.Blue1 = Blue1Data
            fetchTeamStats(team: alliance.1 ?? 0) { Blue2Data in
                teamSet.Blue2 = Blue2Data
                fetchTeamStats(team: alliance.2 ?? 0) { Blue3Data in
                    teamSet.Blue3 = Blue3Data
                    local = [teamSet.Blue1 ?? emptyTeamStat, teamSet.Blue2 ?? emptyTeamStat, teamSet.Blue3 ?? emptyTeamStat]
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
                    loadingData = false
                }
            }
        }
    }
}

struct NumericalCompareViewAlliance: View {
    @State public var teams: [TeamStats]
    @State public var title: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
            HStack {
                Spacer()
                Text(String(teams[0][title].mean + teams[1][title].mean + teams[2][title].mean))
                    .font(.largeTitle)
                Spacer()
            }
        }
    }
}

struct BarThingyViewAlliance: View {
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
                            .tint(Color.accentColor)
                    }
                }
            }
            .padding()
        }
        .padding()
    }
}

public struct AllTeamsList: Codable {
    let status: Int
    let teams: [BasicTeam]
}

public struct BasicTeam: Codable {
    let number: Int
    let nameShort: String
}

struct TeamList: Codable {
    let teamCountTotal, teamCountPage: Int
    let pageCurrent, pageTotal: Int
    let teams: [TeamListTeamEntry]
}

struct TeamListTeamEntry: Codable {
    let teamNumber: Int
    let nameFull, nameShort: String
    let city, stateProv, country: String
    let rookieYear: Int
    let robotName, schoolName, website: String
    let homeCMP: String?
}

#Preview {
    AllianceSimulator()
}
