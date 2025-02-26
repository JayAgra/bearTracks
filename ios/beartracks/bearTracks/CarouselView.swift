//
//  CarouselView.swift
//  bearTracks
//
//  Created by Jayen Agrawal on 2/25/25.
//

import SwiftUI

struct CarouselView: View {
    var imagesUrls: [String]
    @State private var currentIndex = 0
    @State private var images: [UIImage?] = []
    @State private var hasAppeared: Bool = false
    
    init(imagesUrls: [String]) {
        self.imagesUrls = imagesUrls
    }

    var body: some View {
        VStack(spacing: 0) {
            TabView(selection: $currentIndex) {
                ForEach(0..<images.count, id: \.self) { imageIndex in
                    if let image = images[imageIndex] {
                        GeometryReader { geometry in
                            Image(uiImage: image)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geometry.size.width, height: geometry.size.height)
                                .clipped()
                        }
                        .tag(imageIndex)
                    } else {
                        ProgressView()
                            .tag(imageIndex)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
            }
            .tabViewStyle(PageTabViewStyle())
            .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .always))
        }
        .frame(height: 350)
        .onAppear {
            if !hasAppeared {
                hasAppeared.toggle()
                loadImages()
            }
        }
    }
    
    private func loadImages() {
        let dispatchGroup = DispatchGroup()
        
        for urlString in imagesUrls {
            guard let url = URL(string: String("https://beartracks.io/api/v1/pit/image/\(urlString)")) else {
                images.append(nil)
                continue
            }
            
            dispatchGroup.enter()
            loadImage(from: url) { image in
                images.append(image)
                dispatchGroup.leave()
            }
        }
    }

    private func loadImage(from url: URL, completion: @escaping (UIImage?) -> Void) {
        URLSession.shared.dataTask(with: url) { data, _, _ in
            if let data = data, let image = UIImage(data: data) {
                DispatchQueue.main.async {
                    completion(image)
                }
            } else {
                DispatchQueue.main.async {
                    completion(nil)
                }
            }
        }.resume()
    }
}
