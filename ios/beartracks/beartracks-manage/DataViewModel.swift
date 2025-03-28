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
    
    func fetchDataJson(completionBlock: @escaping ([DataEntry]) -> Void) {
        guard
            let url = URL(
                string:
                    "https://beartracks.io/api/v1/data/brief/season/2025"
            )
        else {
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
        self.fetchDataJson { (output) in
            self.dataEntries = output
        }
    }
    
    func deleteSubmission(id: String) {
        guard let url = URL(string: "https://beartracks.io/api/v1/manage/delete/\(id)") else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.httpShouldHandleCookies = true
        
        let requestTask = sharedSession.dataTask(with: request) {
            (data: Data?, response: URLResponse?, error: Error?) in
            if let data = data {
                if let httpResponse = response as? HTTPURLResponse {
                    if httpResponse.statusCode == 200 {
                        self.reload()
                        UINotificationFeedbackGenerator().notificationOccurred(.success)
                    } else {
                        self.reload()
                        UINotificationFeedbackGenerator().notificationOccurred(.error)
                    }
                }
            } else if let error = error {
                print("fetch error: \(error)")
                UINotificationFeedbackGenerator().notificationOccurred(.error)
                self.reload()
            }
        }
        requestTask.resume()
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
