//
//  beartracksApp.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import SwiftUI

@main
struct beartracksApp: App {
    let settingsManager = SettingsManager.shared
    var darkMode: Bool = UserDefaults.standard.bool(forKey: "darkMode")
    
    var body: some Scene {
        WindowGroup {
            TabBar()
                .preferredColorScheme(darkMode ? .dark : .light)
        }
    }
}

extension String {
    func separate(every stride: Int = 4, with separator: Character = " ") -> String {
        return String(enumerated().map { $0 > 0 && $0 % stride == 0 ? [separator, $1] : [$1]}.joined())
    }
}
