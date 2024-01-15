//
//  beartracks_scoutApp.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import SwiftUI

@main
struct beartracks_scoutApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    
    var body: some Scene {
        WindowGroup {
            TabBar()
                .preferredColorScheme(darkMode ? .dark : .light)
        }
    }
}
