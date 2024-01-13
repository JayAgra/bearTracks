//
//  SettingsManager.swift
//  beartracks
//
//  Created by Jayen Agrawal on 1/9/24.
//

import Foundation

class SettingsManager {
    static let shared = SettingsManager()

    private init() {
        let defaults: [String: Any] = [
            "teamNumber": "766",
            "eventCode": "CADA",
            "season": "2023",
            "darkMode": true,
            "haptics": true,
        ]
        UserDefaults.standard.register(defaults: defaults)
    }

    func saveSetting(value: String, forKey key: String) {
        UserDefaults.standard.set(value, forKey: key)
    }

    func getSetting(forKey key: String) -> String? {
        return UserDefaults.standard.string(forKey: key)
    }
}
