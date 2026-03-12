import { Link } from "react-router";
import SalesOrdersCard from "../../imports/Group31";
import PointOfSaleCard from "../../imports/Group32";
import WorkshopsCard from "../../imports/Group";
import InventoryCard from "../../imports/Group33";

const cards = [
  { id: "sales", to: "/sales", Card: SalesOrdersCard },
  { id: "pos", to: "/pos", Card: PointOfSaleCard },
  { id: "workshops", to: "/workshops", Card: WorkshopsCard },
  { id: "inventory", to: "/inventory", Card: InventoryCard },
];

export default function Dashboard() {
  return (
    <div className="h-full overflow-auto">
      <div className="flex flex-col lg:flex-row h-full max-w-[1400px] mx-auto">
        {/* Left Side - Flower Images */}
        <div className="hidden lg:flex flex-col gap-4 w-[35%] max-w-[460px] flex-shrink-0 ml-[60px] py-6">
          <div className="flex-1 min-h-0 rounded-[40px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1766682946451-4e05315828b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5rJTIwcm9zZXMlMjBmbG9yYWwlMjBhcnJhbmdlbWVudCUyMHNob3B8ZW58MXx8fHwxNzczMjgwODI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-h-0 rounded-[40px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1771134572111-967700a8bb31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGZsb3dlciUyMGJvdXF1ZXQlMjBhcnJhbmdlbWVudCUyMGVsZWdhbnR8ZW58MXx8fHwxNzczMjgwODI5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side - Module Cards */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 lg:py-0">
          <div className="grid grid-cols-2 gap-4 sm:gap-[30px] max-w-[600px] w-full">
            {cards.map((card) => {
              const { Card } = card;
              return (
                <Link
                  key={card.id}
                  to={card.to}
                  className="relative aspect-square rounded-[18px] overflow-hidden border-2 border-transparent hover:border-[#ff4e00] hover:shadow-[0_4px_20px_rgba(255,78,0,0.15)] transition-all hover:scale-[1.02]"
                >
                  <Card />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}