//
//  DataView.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import SwiftUI

struct DataView: View {
    @ObservedObject var dataItems: DataViewModel = DataViewModel()
    @State private var showSheet: Bool = false
    @State private var lastDeletedIndex: Int?
    
    var body: some View {
        VStack {
            Text("Data")
                .font(.largeTitle)
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
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
                                    dataItems.setSelectedItem(item: String(entry.Brief.id))
                                    showSheet = true
                                }
                            }
                            .onDelete { indexSet in
                                let removeIndicies = Array(indexSet)
                                lastDeletedIndex = removeIndicies.max()
                                print(dataItems.dataEntries[lastDeletedIndex ?? 0].Brief.id)
                                dataItems.dataEntries.remove(atOffsets: IndexSet(removeIndicies))
                            }
                    }
                } else {
                    Text("no data")
                        .padding(.bottom)
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
