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
    
    var body: some View {
        VStack {
            NavigationView {
                if !dataItems.dataEntries.isEmpty {
                    List {
                        ForEach(dataItems.dataEntries, id: \.Brief.id) { entry in
                            NavigationLink(destination: {
                                DetailedView(model: String(entry.Brief.id))
                                    .navigationTitle("#\(String(entry.Brief.id))")
                            }, label: {
                                VStack {
                                    HStack {
                                        Text("\(String(entry.Brief.team))")
#if os(visionOS)
                .font(.title2)
#else
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .title)
#endif
                                            .padding(.leading)
                                            .frame(maxWidth: .infinity, alignment: .leading)
#if os(visionOS)
                                        Text("match \(String(entry.Brief.match_num))")
                                            .font(.title3)
                                            .padding(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
#else
                                        Text("match \(String(entry.Brief.match_num))")
                                            .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .title)
                                            .padding(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
#endif
                                    }
                                    HStack {
                                        Text("#\(String(entry.Brief.id)) • from \(String(entry.Brief.from_team))")
                                        .padding(.leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                    }
                                }
                                .contentShape(Rectangle())
#if targetEnvironment(macCatalyst)
                                .padding([.top, .bottom])
#endif
                            })
#if os(iOS)
                            .listRowBackground(UIDevice.current.userInterfaceIdiom == .pad ? Color.primary.colorInvert() : nil)
#elseif targetEnvironment(macCatalyst)
                            .listRowBackground(Color.primary.colorInvert())
#endif
                        }
                    }
                    .navigationTitle("Data")
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
