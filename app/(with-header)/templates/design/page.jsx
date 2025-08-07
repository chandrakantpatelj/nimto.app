import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Design() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 flex-shrink-0 bg-white p-4 border-r border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
        <Tabs defaultValue="profile" className="text-sm text-muted-foreground">
          <TabsList variant="line">
            <TabsTrigger value="profile">Details</TabsTrigger>
            <TabsTrigger value="security">Design</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="py-3">
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">Template Name</Label>
                <Input type="text" />
              </div>
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">Category</Label>
                <Input type="text" />
              </div>
              <Label className="text-muted-foreground">Type </Label>

              <RadioGroup
                defaultValue="intermediate"
                className="flex items-center gap-5 mb-5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label
                    htmlFor="intermediate"
                    className="text-foreground text-sm font-normal"
                  >
                    Free
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label
                    htmlFor="beginner"
                    className="text-foreground text-sm font-normal"
                  >
                    Premium
                  </Label>
                </div>
              </RadioGroup>
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Price (in cents)
                </Label>
                <Input type="number" />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="security">Content for Design</TabsContent>
        </Tabs>
      </aside>
      <main className="flex-1 overflow-auto p-8"></main>
      <aside className="w-74 flex-shrink-0 bg-white p-4 border-l border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
        <div className="space-y-6">
          <h3 className="font-semibold text-lg mb-2 border-b pb-2">
            Canvas Settings
          </h3>
          <div className="py-3">
            <p className="text-primary fw-500">Canvas Background</p>
            <div className="w-full mb-5">
              <Label className="text-muted-foreground">
                Color, Gradient, or URL
              </Label>
              <Input type="text" />
            </div>
            <hr className="my-3" />
            <p className="text-primary fw-500">Page Background</p>

            <div className="w-full mb-5">
              <Label className="text-muted-foreground">
                Color, Gradient, or URL
              </Label>
              <Input type="text" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Design;
