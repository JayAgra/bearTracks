//
//  DataView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

/// View for a list of all data
struct DataView: View {
    @ObservedObject var dataItems: DataViewModel = DataViewModel()
    @State private var showSheet: Bool = false
    @State private var selectedItem: String = "-1"
    
    var body: some View {
        VStack {
            NavigationStack {
                if !dataItems.dataEntries.isEmpty {
                    List {
                        ForEach(dataItems.dataEntries, id: \.Brief.id) { entry in
                            VStack {
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
                                        Text(
                                            "#\(String(entry.Brief.id)) • from \(String(entry.Brief.from_team))"
                                        )
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                }
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    selectedItem = String(entry.Brief.id)
                                    showSheet = true
                                }
#if targetEnvironment(macCatalyst)
                                .padding([.top, .bottom])
#endif
                            }
                        }
                    }
                    .navigationTitle("Data")
                    .navigationDestination(isPresented: $showSheet) {
                        DetailedView(model: selectedItem)
                            .navigationTitle("#\(selectedItem)")
                    }
                } else {
                    if dataItems.loadFailed {
                        VStack {
                            Label("failed", systemImage: "xmark.seal.fill")
                                .padding(.bottom)
                                .labelStyle(.iconOnly)
                                .foregroundStyle(Color.pink)
                            Text("load failed")
                                .padding(.bottom)
                        }
                        .navigationTitle("Data")
                    } else {
                        if dataItems.loadComplete {
                            VStack {
                                Label("none", systemImage: "questionmark.app.dashed")
                                    .padding(.bottom)
                                    .labelStyle(.iconOnly)
                                    .foregroundStyle(Color.pink)
                                Text("no data")
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
            }
            .refreshable {
                dataItems.reload()
            }
            .onAppear {
                dataItems.reload()
            }
        }
    }
}

#Preview {
    DataView()
}
