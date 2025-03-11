//
//  AllianceSelection.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 3/10/25.
//

import SwiftUI

struct AllianceSelection: View {
    @Environment(\.dismiss) var dismiss
    @State private var allTeams: AllTeamsList = AllTeamsList(status: 0, teams: [])
    @State private var pickListSeason: Int = UserDefaults().integer(forKey: "pickListSeason")
    @State private var pickListComp: String = UserDefaults().string(forKey: "pickListComp") ?? ""
    @State private var pickListSaved: String = UserDefaults().string(forKey: "pickList") ?? ""
    @State private var pickListStatusSaved: String = UserDefaults().string(forKey: "pickListStatus") ?? ""
    @State private var pickList: [Int] = []
    @State private var pickListStatus: [Int] = [] // 0 - selected, 1 - avail, 2 - unavail/denied
    @State private var pickListObjs: [TeamStatus] = []
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack {
                if !allTeams.teams.isEmpty {
                    List {
                        if !pickListObjs.isEmpty {
                            Section {
                                ForEach(pickListObjs.filter { $0.status == 0 }) { team in
                                    HStack {
                                        Text(String(team.teamNumber))
                                        Spacer()
                                        Label("Value", systemImage: "checkmark.circle.fill")
                                            .labelStyle(.iconOnly)
                                            .foregroundStyle(.green)
                                    }
                                    .swipeActions {
                                        Button {
                                            updateTeamStatus(team, status: 2)
                                        } label: {
                                            Label("Unavailable", systemImage: "xmark").labelStyle(.titleOnly)
                                        }
                                        .tint(.red)
                                        Button {
                                            updateTeamStatus(team, status: 1)
                                        } label: {
                                            Label("Available", systemImage: "xmark").labelStyle(.titleOnly)
                                        }
                                        .tint(.yellow)
                                    }
                                    .contextMenu {
                                        Group {
                                            Button(action: {updateTeamStatus(team, status: 2)}, label: {Label("Unavailable", systemImage: "xmark")})
                                            Button(action: {updateTeamStatus(team, status: 1)}, label: {Label("Available", systemImage: "circle.circle.fill")})
                                        }
                                    }
                                }
                            }
                            Section {
                                ForEach(pickListObjs.filter { $0.status == 1 }) { team in
                                    HStack {
                                        Text(String(team.teamNumber))
                                        Spacer()
                                        Label("Value", systemImage: "circle.circle.fill")
                                            .labelStyle(.iconOnly)
                                            .foregroundStyle(.yellow)
                                    }
                                    .swipeActions {
                                        Button {
                                            updateTeamStatus(team, status: 2)
                                        } label: {
                                            Label("Unavailable", systemImage: "xmark").labelStyle(.titleOnly)
                                        }
                                        .tint(.red)
                                        Button {
                                            updateTeamStatus(team, status: 0)
                                        } label: {
                                            Label("Select", systemImage: "xmark").labelStyle(.titleOnly)
                                        }
                                        .tint(.green)
                                    }
                                    .contextMenu {
                                        Group {
                                            Button(action: {updateTeamStatus(team, status: 2)}, label: {Label("Unavailable", systemImage: "xmark")})
                                            Button(action: {updateTeamStatus(team, status: 0)}, label: {Label("Select", systemImage: "checkmark.circle.fill")})
                                        }
                                    }
                                }
                                .onMove { from, to in
                                    withAnimation {
                                        pickListObjs.move(fromOffsets: from, toOffset: to)
                                    }
                                }
                            }
                            Section {
                                ForEach(pickListObjs.filter { $0.status == 2 }) { team in
                                    HStack {
                                        Text(String(team.teamNumber))
                                        Spacer()
                                        Label("Value", systemImage: "xmark")
                                            .labelStyle(.iconOnly)
                                            .foregroundStyle(.red)
                                    }
                                    .swipeActions {
                                        Button {
                                            updateTeamStatus(team, status: 1)
                                        } label: {
                                            Label("Available", systemImage: "xmark").labelStyle(.titleOnly)
                                        }
                                        .tint(.yellow)
                                    }
                                    .contextMenu {
                                        Group {
                                            Button(action: {updateTeamStatus(team, status: 1)}, label: {Label("Available", systemImage: "circle.circle.fill")})
                                        }
                                    }
                                }
                            }
                        } else {
                            HStack { Spacer(); ProgressView(); Spacer(); }
                        }
                    }
                    .onAppear {
                        listLoadLogic()
                    }
                } else {
                    Spacer(); ProgressView(); Spacer();
                }
            }
            .toolbar {
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button("Reset", systemImage: "trash") {
                        UserDefaults().set(2025, forKey: "pickListSeason")
                        UserDefaults().set(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST", forKey: "pickListComp")
                        pickListObjs = allTeams.teams.map { TeamStatus(teamNumber: $0.number, status: 1) }
                    }
                    EditButton()
                    Button("Close", systemImage: "xmark") {
                        writePickList()
                        writePickListStatus()
                        dismiss()
                    }
                }
            }
            .onAppear {
                getAllTeams()
            }
            .navigationTitle("Alliance Selection")
            .searchable(text: $searchText)
        }
    }
    
    func writePickList() {
        UserDefaults().set(pickListObjs.map { String($0.teamNumber) }.joined(separator: ", "), forKey: "pickList")
    }

    func writePickListStatus() {
        UserDefaults().set(pickListObjs.map { String($0.status) }.joined(separator: ", "), forKey: "pickListStatus")
    }
    
    func listLoadLogic() {
        if pickListSeason == 2025 {
            if pickListComp == UserDefaults.standard.string(forKey: "eventCode") ?? "TEST" {
                pickList = pickListSaved.split(separator: ",").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
                pickListStatus = pickListStatusSaved.split(separator: ",").compactMap { Int($0.trimmingCharacters(in: .whitespaces)) }
                pickListObjs = zip(pickList, pickListStatus).map { TeamStatus(teamNumber: $0, status: $1) }
                return;
            } else {
                UserDefaults().set(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST", forKey: "pickListComp")
            }
        } else {
            UserDefaults().set(2025, forKey: "pickListSeason")
            UserDefaults().set(UserDefaults.standard.string(forKey: "eventCode") ?? "TEST", forKey: "pickListComp")
        }
        
        pickListObjs = allTeams.teams.map { TeamStatus(teamNumber: $0.number, status: 1) }
        writePickList()
        writePickListStatus()
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
    
    func updateTeamStatus(_ team: TeamStatus, status: Int) {
        if let index = pickListObjs.firstIndex(where: { $0.id == team.id }) {
            pickListObjs[index].status = status
        }
    }
}

#Preview {
    AllianceSelection()
}

struct TeamStatus: Identifiable {
    let id = UUID()
    var teamNumber: Int
    var status: Int
}
