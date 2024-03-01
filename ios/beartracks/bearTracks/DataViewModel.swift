//
//  DataViewModel.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/11/24.
//

import Foundation
import SwiftUI
/// Controller for data list view. Handles the data request.
class DataViewModel: ObservableObject {
    @Published private(set) var dataEntries: [DataEntry]
    @Published private(set) var loadFailed: Bool = false
    @Published private(set) var loadComplete: Bool = false
    
    init() {
        self.dataEntries = []
        self.reload()
    }
    
    func fetchEventJson(completionBlock: @escaping ([DataEntry]) -> Void) -> Void {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/event/\(UserDefaults.standard.string(forKey: "season") ?? "2024")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CAFR")") else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        self.loadFailed = false
                        self.loadComplete = true
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    self.loadFailed = true
                    completionBlock([])
                }
            } else if let error = error {
                print("fetch error: \(error)")
                self.loadFailed = true
                completionBlock([])
            }
        }
        requestTask.resume()
    }
    
    func reload() {
        self.fetchEventJson() { (output) in
            self.dataEntries = output
        }
    }
}

/// Represents a data entry containing a Brief data structure
struct DataEntry: Codable, Identifiable {
    var id = UUID()
    let Brief: BriefData
    
    private enum CodingKeys: String, CodingKey {
        case Brief
    }
}

/// Brief data structure from beartracks server
struct BriefData: Codable, Identifiable {
    let id: Int
    let event: String
    let season: Int
    let team: Int
    let match_num: Int
    let user_id: Int
    let name: String
    let from_team: Int
    let weight: String
}
