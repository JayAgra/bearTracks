//
//  DataView.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

struct DataView: View {
    @State private var eventData: [DataEntry] = []
    @State private var selectedEntry: Int? = nil
    @State private var isShowingSheet = false
    
    var body: some View {
        VStack {
            Text("Data")
                .font(.largeTitle)
                .padding(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
            ScrollView {
                LazyVStack {
                    if !eventData.isEmpty {
                        ForEach(eventData, id: \.Brief.id) { entry in
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
                            .padding()
                            .onTapGesture {
                                selectedEntry = entry.Brief.id
                                isShowingSheet.toggle()
                            }
                            Divider()
                        }
                    } else {
                        Text("loading data...")
                            .padding(.bottom)
                    }
                }
            }.refreshable {
                fetchEventJson()
            }
        }
        .padding()
        .onAppear() {
            fetchEventJson()
        }
        .sheet(isPresented: $isShowingSheet, content: {
            if let selectedEntry = selectedEntry {
                DetailedView(targetId: selectedEntry)
            }
        })
    }
    
    func fetchEventJson() {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/event/\(UserDefaults.standard.string(forKey: "season") ?? "2023")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CADA")") else {
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, _, error in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        self.eventData = result
                    }
                } catch {
                    print("parse error")
                }
            } else if let error = error {
                print("fetch error: \(error)")
            }
        }.resume()
    }
}

#Preview {
    DataView()
}

struct DataEntry: Codable {
    let Brief: BriefData
}

struct BriefData: Codable {
    let id: Int
    let event: String
    let season: Int
    let team: Int
    let match_num: Int
    let game: String
    let user_id: Int
    let name: String
    let from_team: Int
    let weight: String
}
