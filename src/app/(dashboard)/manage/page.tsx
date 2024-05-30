import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CategoryList from "../_components/CategoryList";

const ManagePage = () => {
  return (
    <>
      <section className="bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-lg sm:text-xl md:text-3xl font-bold">Manage</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Manage your account settings and categories
            </p>
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl md:text-3xl font-bold">
              Currency
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Set your default currency for transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencyComboBox />
          </CardContent>
        </Card>

        <CategoryList type="income" />
        <CategoryList type="expense" />
      </section>
    </>
  );
};

export default ManagePage;
