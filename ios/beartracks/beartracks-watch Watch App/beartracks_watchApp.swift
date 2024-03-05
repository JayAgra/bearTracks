//
//  beartracks_watchApp.swift
//  beartracks-watch Watch App
//
//  Created by Jayen Agrawal on 3/4/24.
//

import SwiftUI

@main
struct beartracks_watch_Watch_AppApp: App {
    let settingsManager = SettingsManager.shared
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            if !appState.loginRequired {
                Teams()
                    .onAppear() {
                        checkLoginState { isLoggedIn in
                            appState.loginRequired = !isLoggedIn
                        }
                    }
                    .environmentObject(appState)
            } else {
                LoginView()
                    .environmentObject(appState)
                    .preferredColorScheme(.dark)
            }
        }
    }
}
