//
//  DataViewModel.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/15/24.
//

import Foundation
import SwiftUI

class DataViewModel: ObservableObject {
    @Published public var dataEntries: [DataEntry]
    @Published private(set) var selectedItem: String = "-1"
    @State private var isShowingSheet = false
    
    init() {
        self.dataEntries = []
        self.reload()
    }
    
    func setSelectedItem(item: String) {
        selectedItem = item
    }
    
    func getSelectedItem() -> String {
        return selectedItem
    }
    
    func fetchEventJson(completionBlock: @escaping ([DataEntry]) -> Void) -> Void {
        guard let url = URL(string: "https://beartracks.io/api/v1/data/brief/event/\(UserDefaults.standard.string(forKey: "season") ?? "2024")/\(UserDefaults.standard.string(forKey: "eventCode") ?? "CADA")") else {
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
                        if UserDefaults.standard.bool(forKey: "haptics") {
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                        }
                        completionBlock(result)
                    }
                } catch {
                    print("parse error")
                    if UserDefaults.standard.bool(forKey: "haptics") {
                        UINotificationFeedbackGenerator().notificationOccurred(.error)
                    }
                    return
                }
            } else if let error = error {
                print("fetch error: \(error)")
                if UserDefaults.standard.bool(forKey: "haptics") {
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                }
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
    let user_id: Int
    let name: String
    let from_team: Int
    let weight: String
}
