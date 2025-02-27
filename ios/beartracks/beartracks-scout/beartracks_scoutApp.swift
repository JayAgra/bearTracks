//
//  beartracks_scoutApp.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI
import UserNotifications

public enum Tab {
    case start, game, end, review, settings
}

@main
struct beartracks_scoutApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @StateObject var scoutFormController: ScoutingController = ScoutingController()
    let notificationCenter = UNUserNotificationCenter.current()
    
    var body: some Scene {
        WindowGroup {
            if scoutFormController.loginRequired == 1 {
                TabView(selection: $scoutFormController.currentTab) {
                    StartView()
                        .environmentObject(scoutFormController)
                        .tabItem { Label("Start", systemImage: "backward.end") }
                        .tag(Tab.start)
                    GameView()
                        .environmentObject(scoutFormController)
                        .tabItem { Label("Game", systemImage: "gamecontroller") }
                        .tag(Tab.game)
                    EndView()
                        .environmentObject(scoutFormController)
                        .tabItem { Label("End", systemImage: "forward.end") }
                        .tag(Tab.end)
                    ReviewView()
                        .environmentObject(scoutFormController)
                        .tabItem { Label("Review", systemImage: "magnifyingglass") }
                        .tag(Tab.review)
                    SettingsView()
                        .environmentObject(scoutFormController)
                        .tabItem { Label("Settings", systemImage: "gear") }
                        .tag(Tab.settings)
                }
                .preferredColorScheme(darkMode ? .dark : .light)
                .onAppear {
                    scoutFormController.checkLoginState()
                    scoutFormController.getMatches { result in
                        scoutFormController.matchList = result
                    }
                    Task {
                        do {
                            try await notificationCenter.requestAuthorization(options: [.alert, .badge, .sound])
                        } catch {
                            print("failed to request notification auth")
                        }
                    }
                }
                .environmentObject(scoutFormController)
            } else if scoutFormController.loginRequired == 2 {
                LoginView()
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .environmentObject(scoutFormController)
                    .onAppear { scoutFormController.checkLoginState() }
            } else {
                VStack {
                    ProgressView()
                }
                .onAppear {
                    scoutFormController.checkLoginState()
                }
            }
        }
    }
}
