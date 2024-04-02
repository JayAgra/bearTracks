//
//  DataView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct DataView: View {
    @EnvironmentObject var appState: AppState
    @State var selectedEntry: Int? = nil
    @State var loadFailed: Bool = false
    @State var loadComplete: Bool = false
    
    var body: some View {
        VStack {
            NavigationView {
                if !appState.dataEntries.isEmpty {
                    List {
                        ForEach(0..<appState.dataEntries.count, id: \.self) { index in
                            NavigationLink(tag: index, selection: self.$selectedEntry, destination: {
                                DetailedView(model: String(appState.dataEntries[index].Brief.id))
                                    .navigationTitle("#\(String(appState.dataEntries[index].Brief.id))")
                                    .environmentObject(appState)
                            }, label: {
                                VStack {
                                    HStack {
                                        Text("\(String(appState.dataEntries[index].Brief.team))")
#if os(visionOS)
                .font(.title2)
#else
                .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .title)
#endif
                                            .padding(.leading)
                                            .frame(maxWidth: .infinity, alignment: .leading)
#if os(visionOS)
                                        Text("match \(String(appState.dataEntries[index].Brief.match_num))")
                                            .font(.title3)
                                            .padding(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
#else
                                        Text("match \(String(appState.dataEntries[index].Brief.match_num))")
                                            .font(UIDevice.current.userInterfaceIdiom == .pad ? .title2 : .title)
                                            .padding(.trailing)
                                            .frame(maxWidth: .infinity, alignment: .trailing)
#endif
                                    }
                                    HStack {
                                        Text("#\(String(appState.dataEntries[index].Brief.id)) • from \(String(appState.dataEntries[index].Brief.from_team))")
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
                    if self.loadFailed {
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
                        if self.loadComplete {
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
                appState.reloadDataJson()
            }
            .onAppear {
                appState.reloadDataJson()
            }
        }
    }
}

#Preview {
    DataView()
}
