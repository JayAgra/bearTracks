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
            "eventCode": "CAFR",
            "season": "2024",
            "darkMode": true,
            "useAllCompData": false,
        ]
        UserDefaults(suiteName: "group.com.jayagra.beartracks")?.register(defaults: defaults)
    }
}
