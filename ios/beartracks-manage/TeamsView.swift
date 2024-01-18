//
//  TeamsView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/16/24.
//

import SwiftUI

struct TeamsView: View {
    @ObservedObject var teamsModel: TeamsViewModel = TeamsViewModel()
    @State private var lastDeletedIndex: Int?
    @State private var showCreateSheet: Bool = false
    @State private var lastDeletedId: String = "-1"
    @State private var lastDeletedTeam: String = "-1"
    @State private var showConfirmDialog: Bool = false
    
    var body: some View {
        VStack {
            NavigationStack {
                if !teamsModel.teamList.isEmpty {
                    List {
                        ForEach(teamsModel.teamList, id: \.id) { team in
                            VStack {
                                HStack {
                                    Text("\(String(team.team))")
                                        .font(.title)
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("#\(String(team.id))")
                                        .font(.title)
                                        .padding(.trailing)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                }
                                HStack {
                                    Text("key \(String(team.key))")
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .contentShape(Rectangle())
                        }
                        .onDelete { indexSet in
                            lastDeletedIndex = Array(indexSet).max()
                            lastDeletedId = String(teamsModel.teamList[lastDeletedIndex ?? 0].id)
                            lastDeletedTeam = String(teamsModel.teamList[lastDeletedIndex ?? 0].team)
                            showConfirmDialog = true
                        }
                    }
                    .navigationTitle("Teams")
                    .toolbar {
                        ToolbarItem(placement: .topBarTrailing) {
                            Button("Add", systemImage: "plus.circle") {
                                self.showCreateSheet = true
                            }
                            .imageScale(.large)
                        }
                    }
                    .alert(isPresented: $showConfirmDialog) {
                        Alert(
                            title: Text("Delete Team Key for \(self.lastDeletedTeam)"),
                            message: Text("are you sure you would like to delete this user? this action is irreversable."),
                            primaryButton: .destructive(Text("Delete")) {
                                teamsModel.deleteTeamKey(id: lastDeletedId)
                            },
                            secondaryButton: .cancel()
                        )
                    }
                } else {
                    VStack {
                        Text("no data")
                            .padding(.bottom)
                    }
                    .navigationTitle("Teams")
                }
            }
            .refreshable {
                teamsModel.reload()
            }
            .onAppear() {
                teamsModel.reload()
            }
            .sheet(isPresented: $showCreateSheet, onDismiss: {
                self.showCreateSheet = false
                teamsModel.reload()
            }, content: {
                CreateKeyView()
            })
        }
    }
}

#Preview {
    TeamsView()
}
