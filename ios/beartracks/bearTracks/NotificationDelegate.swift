//
//  NotificationDelegate.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/27/25.
//

import Foundation
import SwiftUI
import UserNotifications

struct TokenUpload: Codable {
    let token: String
}

class NotificationDelegate: NSObject, UIApplicationDelegate, ObservableObject {
    var app: beartracksApp?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        application.registerForRemoteNotifications()
        UNUserNotificationCenter.current().delegate = self
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let stringifiedToken = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("stringifiedToken: ", stringifiedToken)
        
        let token = TokenUpload(token: stringifiedToken)
        guard let url = URL(string: "https://beartracks.io/api/v1/auth/apn/insert_token") else { return }
        
        do {
            let jsonData = try JSONEncoder().encode(token)
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = jsonData
            request.httpShouldHandleCookies = true
            let requestTask = sharedSession.dataTask(with: request) {
                (data: Data?, response: URLResponse?, error: Error?) in
                if data != nil {
                    if let httpResponse = response as? HTTPURLResponse {
                        if httpResponse.statusCode == 200 {
                            print("success")
                        } else {
                            print("Response code \(httpResponse.statusCode)")
                        }
                    } else {
                        print("Response handling error")
                    }
                } else {
                    print("Server response nil")
                }
            }
            requestTask.resume()
        } catch {
            print("Data encoding error")
        }
    }
}

extension NotificationDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) async {
            print("notification ", response.notification.request.content.title)
    }
    
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification) async -> UNNotificationPresentationOptions {
        return [.badge, .banner, .list, .sound]
    }
}
