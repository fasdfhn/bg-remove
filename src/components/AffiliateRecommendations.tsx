import React from 'react';

const AffiliateRecommendations = () => {
  const products = [
    {
      title: "Professional Hair Dryer with Ionic Technology",
      description: "Fast-drying, low noise professional hair dryer with multiple heat settings",
      link: "https://amzn.to/42bs8qs",
      price: "$79.99",
      tag: "#ad"
    },
    {
      title: "Modelones Gel Nail Kit with LED Light",
      description: "Professional nail kit with 150 PCS press-on nails and LED lamp",
      link: "https://amzn.to/42raKN4", 
      price: "$24.99",
      tag: "#commissionsearned"
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        Recommended Products 
        <span className="text-sm font-normal text-gray-400 ml-2">#ad</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product, index) => (
          <a 
            key={index}
            href={product.link}
            target="_blank"
            rel="nofollow sponsored"
            className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-800">{product.title}</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {product.tag}
              </span>
            </div>
            <p className="text-gray-600 text-sm mt-2">{product.description}</p>
            <p className="text-blue-600 font-semibold mt-2">{product.price}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500">View on Amazon</span>
              <span className="text-xs text-gray-400 ml-2">#commissionsearned</span>
            </div>
          </a>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-4 p-4 bg-gray-800 bg-opacity-30 rounded">
        <p className="mb-2">
          <strong>Advertisement:</strong> As an Amazon Associate, we earn from qualifying purchases.
        </p>
        <p>
          The products recommended above include affiliate links. When you make a purchase through these links, 
          we may earn a commission at no additional cost to you.
        </p>
      </div>
    </div>
  );
};

export default AffiliateRecommendations; 