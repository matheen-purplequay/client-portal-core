import { useState } from "react";
import type { Template } from "../../../../../../core/models/template";
import { ChevronRight } from "lucide-react";
import { TemplateChooserPage } from "./components/screen-template-chooser";
import { ScreenAddQueries } from "./components/screen-add-queries";
import { PreviewNewQueries } from "./components/screen-preview-new-queries";

interface NewQueryScreen {
    id: "choose-template" | "add-queries" | "preview-send";
    label: string;
}

export const NewQuery = () => {
    const screens = [
        { id: 'choose-template', label: 'Choose Template' },
        { id: 'add-queries', label: 'Add Queries' },
        { id: 'preview-send', label: 'Preview & Send' },
      ] as const satisfies readonly [
        { id: 'choose-template'; label: string },
        { id: 'add-queries'; label: string },
        { id: 'preview-send'; label: string },
      ];
      
    const [currentScreen, setCurrentScreen] = useState<'choose-template' | 'add-queries' | 'preview-send'>('choose-template');
    const [chosenTemplate, setChosenTemplate] = useState<Template | null>(null);

    const handleChooseTemplate = (template: Template) => {
        setCurrentScreen('add-queries');
        setChosenTemplate(template);
    };

    const handleAddQueries = () => {
        setCurrentScreen('preview-send');
    };

    const handlePrevScreen = () => {
        setCurrentScreen('choose-template');
    };

    return (
        <div>
            <div className="flex items-center justify-center gap-4 text-xs py-3">
                {screens.map((screen: NewQueryScreen, index: number) => (
                    <>
                        <div key={screen.id} className={`rounded-full px-3 py-1 ${currentScreen === screen.id ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                            {screen.label}
                        </div>
                        {index < screens.length - 1 && <ChevronRight strokeWidth={1.5} className="text-slate-500" />}
                    </>
                ))}
            </div>
            {currentScreen === 'choose-template' && 
                <div className="max-w-full lg:max-w-[800px] xl:max-w-[1280px]">
                    <TemplateChooserPage templateChoosed={handleChooseTemplate} />
                </div>
            }
            <div>
                <div className="px-10">
                    {currentScreen === 'add-queries' && chosenTemplate && (
                        <ScreenAddQueries 
                            template={chosenTemplate} 
                            doesRequireDocuments={true} 
                            nextScreen={handleAddQueries} 
                            prevScreen={handlePrevScreen} />
                    )}
                    {currentScreen === 'preview-send' && chosenTemplate && (
                        <PreviewNewQueries template={chosenTemplate} />
                    )}
                </div>
            </div>
        </div>
    );
};