//
//  SettingsManager.swift
//  beartracks-scout
//
//  Created by Jayen Agrawal on 1/14/24.
//

import Foundation

class SettingsManager {
    static let shared = SettingsManager()

    private init() {
        let defaults: [String: Any] = [
            "darkMode": true,
            "haptics": true
        ]
        UserDefaults.standard.register(defaults: defaults)
    }
}
