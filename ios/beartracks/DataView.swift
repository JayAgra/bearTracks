//
//  DataView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct DataView: View {
    @ObservedObject var dataItems: DataViewModel = DataViewModel()
    @State private var showSheet: Bool = false
    
    var body: some View {
        VStack {
            NavigationView {
                if !dataItems.dataEntries.isEmpty {
                    List {
                        ForEach(dataItems.dataEntries, id: \.Brief.id) { entry in
                            VStack {
                                HStack {
                                    Text("\(String(entry.Brief.team))")
                                        .font(.title)
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    Text("match \(String(entry.Brief.match_num))")
                                        .font(.title)
                                        .padding(.trailing)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                }
                                HStack {
                                    Text("#\(String(entry.Brief.id)) • from \(String(entry.Brief.from_team)) (\(entry.Brief.name))")
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                            }
                            .contentShape(Rectangle())
                            .onTapGesture() {
                                // sheetConfig.selectId(id: String(entry.Brief.id))
                                dataItems.setSelectedItem(item: String(entry.Brief.id))
                                showSheet = true
                            }
                        }
                    }
                    .navigationTitle("Data")
                } else {
                    if dataItems.loadFailed {
                        VStack {
                            Label("failed", systemImage: "xmark.seal.fill")
                                .padding(.bottom)
                                .labelStyle(.iconOnly)
                            Text("load failed")
                                .padding(.bottom)
                        }
                        .navigationTitle("Data")
                    } else {
                        VStack {
                            Label("loading", systemImage: "hourglass")
                                .padding(.bottom)
                                .labelStyle(.iconOnly)
                            Text("loading data...")
                                .padding(.bottom)
                        }
                        .navigationTitle("Data")
                    }
                }
            }
            .refreshable {
                dataItems.reload()
            }
            .onAppear() {
                dataItems.reload()
            }
        }
        .sheet(isPresented: $showSheet, onDismiss: {
                showSheet = false
        }, content: {
            DetailedView(model: dataItems)
        })
        // &y mode
        // .background(Color(red: 0.98, green: 0.73, blue: 0.84, opacity: 1.0))
    }
    
//    func getSheetConfig() -> DetailSheetConfig {
//        return sheetConfig
//    }
}

#Preview {
    DataView()
}

struct DetailSheetConfig {
    var selectedId: String = "-1"
    var showSheet = false
 
    mutating func selectId(id: String) {
        selectedId = id
        showSheet = true
    }
    
    mutating func deselect() {
        selectedId = "-1"
        showSheet = false
    }
}
