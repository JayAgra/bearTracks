//
//  TeamsViewModel.swift
//  beartracks-manage
//
//  Created by Jayen Agrawal on 1/16/24.
//

import Foundation
import SwiftUI

class TeamsViewModel: ObservableObject {
  @Published public var teamList: [TeamKey]
  @Published private(set) var selectedItem: String = "-1"

  init() {
    self.teamList = []
    self.reload()
  }

  func fetchUsersJson(completionBlock: @escaping ([TeamKey]) -> Void) {
    guard let url = URL(string: "https://beartracks.io/api/v1/manage/all_access_keys") else {
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
          let result = try decoder.decode([TeamKey].self, from: data)
          DispatchQueue.main.async {
            if UserDefaults.standard.bool(forKey: "haptics") {
              UINotificationFeedbackGenerator().notificationOccurred(.success)
            }
            completionBlock(result)
          }
        } catch {
          print("parse error \(error)")
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
    self.fetchUsersJson { output in
      self.teamList = output
    }
  }

  func deleteTeamKey(id: String) {
    guard let url = URL(string: "https://beartracks.io/api/v1/manage/access_key/delete/\(id)")
    else {
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

struct TeamKey: Codable {
  let id: Int
  let key: Int
  let team: Int
}
