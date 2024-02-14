//
//  UsersViewModel.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/16/24.
//

import Foundation
import SwiftUI

class UsersViewModel: ObservableObject {
    @Published public var usersList: [UsersListing]
    @Published private(set) var selectedItem: String = "-1"
    
    init() {
        self.usersList = []
        self.reload()
    }
    
    func fetchUsersJson(completionBlock: @escaping ([UsersListing]) -> Void) -> Void {
        guard let url = URL(string: "https://beartracks.io/api/v1/manage/all_users") else {
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
                    let result = try decoder.decode([UsersListing].self, from: data)
                    DispatchQueue.main.async {
                        completionBlock(result)
                    }
                } catch {
                    print("parse error \(error)")
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
        self.fetchUsersJson() { output in
            self.usersList = output
        }
    }
    
    func deleteUser(id: String) {
        guard let url = URL(string: "https://beartracks.io/api/v1/manage/user/delete/\(id)") else {
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

struct UsersListing: Codable {
    let id: Int
    let username: String
    let team: Int
    let admin: String
    let team_admin: Int
    let score: Int
}
