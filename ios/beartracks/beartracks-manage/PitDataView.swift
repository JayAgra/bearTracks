//
//  PitDataView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 2/4/25.
//

import SwiftUI

struct PitDataView: View {
    @ObservedObject var dataItems: PitDataViewModel = PitDataViewModel()
    @State private var showSheet: Bool = false
    @State private var lastDeletedIndex: Int?
    @State private var lastDeletedId: String = "-1"
    @State private var showConfirmDialog: Bool = false
    
    var body: some View {
        VStack {
            NavigationStack {
                if !dataItems.dataEntries.isEmpty {
                    List {
                        ForEach(dataItems.dataEntries, id: \.id) { entry in
                            VStack {
                                HStack {
                                    Text("\(String(entry.team)) @ \(entry.event)")
                                        .font(.title)
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                HStack {
                                    Text(
                                        "#\(String(entry.id)) • from \(String(entry.from_team)) (\(entry.name))"
                                    )
                                    .padding(.leading)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .contentShape(Rectangle())
                            .onTapGesture {
                                dataItems.setSelectedItem(item: String(entry.id))
                                showSheet = true
                            }
                        }
                        .onDelete { indexSet in
                            lastDeletedIndex = Array(indexSet).max()
                            lastDeletedId = String(dataItems.dataEntries[lastDeletedIndex ?? 0].id)
                            showConfirmDialog = true
                        }
                    }
                    .navigationTitle("Data")
                    .alert(isPresented: $showConfirmDialog) {
                        Alert(
                            title: Text("Delete Submission \(self.lastDeletedId)"),
                            message: Text(
                                "are you sure you would like to delete the data? this action is irreversible."),
                            primaryButton: .destructive(Text("Delete")) {
                                dataItems.deleteSubmission(id: lastDeletedId)
                            },
                            secondaryButton: .cancel()
                        )
                    }
                    .refreshable {
                        dataItems.reload()
                    }
                    .onAppear {
                        dataItems.reload()
                    }
                } else {
                    VStack {
                        Text("no data")
                            .padding(.bottom)
                        Button(action: {
                            dataItems.reload()
                        }, label: {
                            Label("Reload", systemImage: "xmark")
                                .labelStyle(.titleOnly)
                        })
                    }
                    .navigationTitle("Data")
                }
            }
            .refreshable {
                dataItems.reload()
            }
            .onAppear {
                dataItems.reload()
            }
        }
        .sheet(
            isPresented: $showSheet,
            onDismiss: {
                showSheet = false
            },
            content: {
                VStack {}
            })
    }
}

#Preview {
    PitDataView()
}
