//
//  beartracks_scoutApp.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

public enum Tab {
    case start, game, end, review, settings
}

@main
struct beartracks_scoutApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    @StateObject var scoutFormController: ScoutingController = ScoutingController()
    
    var body: some Scene {
        WindowGroup {
            if !scoutFormController.loginRequired {
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
                    checkLoginState { isLoggedIn in
                        scoutFormController.loginRequired = !isLoggedIn
                    }
                    scoutFormController.getMatches { result in
                        scoutFormController.matchList = result
                    }
                }
                .environmentObject(scoutFormController)
            } else {
                LoginView()
                    .preferredColorScheme(darkMode ? .dark : .light)
                    .environmentObject(scoutFormController)
            }
        }
    }
}
