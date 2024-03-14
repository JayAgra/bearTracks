//
//  UsersView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/16/24.
//

import SwiftUI

struct UsersView: View {
    @ObservedObject var userModel: UsersViewModel = UsersViewModel()
    @State private var lastDeletedIndex: Int?
    @State private var lastDeletedId: String = "-1"
    @State private var showConfirmDialog: Bool = false
    
    var body: some View {
        VStack {
            NavigationStack {
                if !userModel.usersList.isEmpty {
                    List {
                        ForEach(userModel.usersList, id: \.id) { user in
                            VStack {
                                HStack {
                                    Text("\(String(user.username))")
                                        .font(.title)
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                HStack {
                                    Text("team \(String(user.team)) • #\(String(user.id)) • \(String(user.score))pts")
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .contentShape(Rectangle())
                        }
                        .onDelete { indexSet in
                            lastDeletedIndex = Array(indexSet).max()
                            lastDeletedId = String(userModel.usersList[lastDeletedIndex ?? 0].id)
                            showConfirmDialog = true
                        }
                    }
                    .navigationTitle("Users")
                    .alert(isPresented: $showConfirmDialog) {
                        Alert(
                            title: Text("Delete User \(self.lastDeletedId)"),
                            message: Text(
                                "are you sure you would like to delete this user? this action is irreversable."),
                            primaryButton: .destructive(Text("Delete")) {
                                userModel.deleteUser(id: lastDeletedId)
                            },
                            secondaryButton: .cancel()
                        )
                    }
                } else {
                    VStack {
                        Text("no data")
                            .padding(.bottom)
                    }
                    .navigationTitle("Users")
                }
            }
            .refreshable {
                userModel.reload()
            }
            .onAppear {
                userModel.reload()
            }
        }
    }
}

#Preview {
    UsersView()
}
