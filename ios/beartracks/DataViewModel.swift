//
//  DataViewModel.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/11/24.
//

import Foundation
import SwiftUI

class DataViewModel: ObservableObject {
    @Published private(set) var dataEntries: [DataEntry]
    @State private var isShowingSheet = false
    
    init() {
        self.dataEntries = []
        self.reload()
    }
    
    func fetchEventJson(completionBlock: @escaping ([DataEntry]) -> Void) -> Void {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/event/\(UserDefaults.standard.string(forKey: "season") ?? "2023")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CADA")") else {
            return
        }
        
        let requestTask = URLSession.shared.dataTask(with: url) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                do {
                    let decoder = JSONDecoder()
                    let result = try decoder.decode([DataEntry].self, from: data)
                    DispatchQueue.main.async {
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                    return
                }
            } else if let error = error {
                print("fetch error: \(error)")
                UINotificationFeedbackGenerator().notificationOccurred(.error)
                return
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
